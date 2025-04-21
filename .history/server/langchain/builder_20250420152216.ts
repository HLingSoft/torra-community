import type { FlowNode, LangFlowJson } from '~/types/workflow'
import type { DAGStepInfo } from '~/types/ws'
import { initFactories, nodeFactoryMap } from './factories'

initFactories()

type DAGContext = Record<string, any>
type NodeResultsMap = Record<string, Record<string, any>>
interface ExecuteDAGOptions {
  onStep?: (step: DAGStepInfo) => void
}
type OutputConnection = {
  fromPortId: string
  toNodeId: string
  toPortId: string
}

export async function executeDAG(
  json: LangFlowJson,
  inputMessage: string,
  options?: ExecuteDAGOptions,
) {
  const context: DAGContext = {}
  const results: NodeResultsMap = {}
  context.results = results
  context.json = json

  let inputConnections = buildInputConnections(json)
  const outputConnections = buildOutputConnections(json)

  const customNodeIds = Object.keys(json.nodes).filter(id => json.nodes[id].type === 'custom')
  const initialSorted = topoSortSafe(json.nodes, inputConnections, customNodeIds)
  let pending = [...initialSorted]
  const executed = new Set<string>()

  while (pending.length > 0) {
    const nextIdx = pending.findIndex(id => {
      const inputs = inputConnections[id]
      return (
        !inputs ||
        Object.values(inputs).every(connArr =>
          connArr.every(conn => executed.has(conn.fromNodeId))
        )
      )
    })

    if (nextIdx === -1) {
      throw new Error('❌ 无法找到可执行节点，可能存在循环依赖或残缺图')
    }

    const nodeId = pending.splice(nextIdx, 1)[0]
    const node = json.nodes[nodeId]

    console.log(`🔗 执行节点 [${executed.size + 1}/${initialSorted.length}] ${nodeId} ${node.data.type}`)

    if (isStartNode(json, node.id)) {
      node.data.inputValue = inputMessage
    }

    const resolvedInput: Record<string, any> = {}
    const connMapForNode = inputConnections[node.id] || {}

    for (const [inputPortId, connOrArray] of Object.entries(connMapForNode)) {
      const conns = Array.isArray(connOrArray)
        ? connOrArray
        : [connOrArray as { fromNodeId: string; fromPortId: string }]

      const values = conns
        .map(conn => results[conn.fromNodeId]?.[conn.fromPortId])
        .filter(v => v !== undefined)

      resolvedInput[inputPortId] = values.length === 1 ? values[0] : values
    }

    const factory = nodeFactoryMap[node.data.type]
    if (!factory) throw new Error(`❌ 无法找到工厂: ${node.data.type}`)

    const start = performance.now()
    const factoryOutput = await factory(node, { ...context, resolvedInput })
    const end = performance.now()
    const elapsed = Math.round(end - start)

    results[node.id] = factoryOutput
    executed.add(node.id)

    options?.onStep?.({
      index: executed.size,
      total: pending.length + executed.size,
      nodeId: node.id,
      type: node.data.type,
      output: factoryOutput,
      outputPreview: '',
      elapsed,
      elapsedStr: formatElapsed(elapsed),
    })

   // ✅ IfElse 分支控制逻辑（按分支起点精确剪枝）
if (node.data.type === 'IfElse') {
  const isTrueBranch = factoryOutput.default === true
  const skipPortId = isTrueBranch
    ? node.data.falseOutputVariable.id
    : node.data.trueOutputVariable.id
  const activePortId = isTrueBranch
    ? node.data.trueOutputVariable.id
    : node.data.falseOutputVariable.id

  const skipPortNodeId = findPortNodeIdById(json, node.id, skipPortId)
  const activePortNodeId = findPortNodeIdById(json, node.id, activePortId)

  if (!skipPortNodeId || !activePortNodeId) {
    throw new Error(`❌ IfElse 节点 ${node.id} 的端口 ID 查找失败`)
  }

  const skipEntryIds = outputConnections[node.id]?.[skipPortNodeId]?.map(conn => conn.toNodeId) || []
  const activeEntryIds = outputConnections[node.id]?.[activePortNodeId]?.map(conn => conn.toNodeId) || []

// 1. 保留 activeSet（分支内子图）
const activeSet = new Set<string>()
for (const id of activeEntryIds) {
  collectDownstream(id, outputConnections).forEach(i => activeSet.add(i))
}

// 2. 查找所有 active 节点的依赖祖先
const upstream = collectUpstream([...activeSet], inputConnections)
upstream.forEach(id => activeSet.add(id)) // 合并进 activeSet

// 3. 去除 true 分支节点
const toRemove = new Set<string>()
for (const id of skipEntryIds) {
  collectDownstream(id, outputConnections).forEach(i => {
    if (!activeSet.has(i)) {
      toRemove.add(i)
    }
  })
}

// 4. 执行队列更新
const prunedPending = pending.filter(id => !toRemove.has(id))
const toAdd = [...activeSet].filter(id => !executed.has(id) && !prunedPending.includes(id))

inputConnections = buildInputConnections(json)
const extra = topoSortSafe(json.nodes, inputConnections, toAdd)
pending = [...prunedPending, ...extra]

  console.log(`[IfElse] ${node.id} 分支`, isTrueBranch)
  console.log('toRemove:', [...toRemove])
  console.log('activeSet:', [...activeSet])
  console.log('补全节点:', extra)
}

  }

  const lastId = [...executed].at(-1)!
  const lastNode = json.nodes[lastId]
  const lastResult = results[lastId]
  const output =
    lastResult.default ||
    lastResult[lastNode.data?.outputVariable?.id] ||
    Object.values(lastResult)[0] ||
    '未设置默认值'

  console.log('🟢 最终输出:', output)

  return {
    results,
    output,
  }
}

function findPortNodeIdById(json: LangFlowJson, parentNodeId: string, portId: string): string | undefined {
  return Object.values(json.nodes).find(
    n => n.data?.parentNode === parentNodeId && n.id === portId
  )?.id
}

function buildInputConnections(json: LangFlowJson) {
  const connections: Record<string, Record<string, { fromNodeId: string; fromPortId: string }[]>> = {}
  for (const edge of json.edges) {
    const sourceCustomId = edge.data.sourceParent
    const targetCustomId = edge.data.targetParent
    if (!sourceCustomId || !targetCustomId) continue
    connections[targetCustomId] ||= {}
    connections[targetCustomId][edge.target] ||= []
    connections[targetCustomId][edge.target].push({
      fromNodeId: sourceCustomId,
      fromPortId: edge.source,
    })
  }
  return connections
}

function buildOutputConnections(json: LangFlowJson) {
  const outputMap: Record<string, Record<string, OutputConnection[]>> = {}
  for (const edge of json.edges) {
    const from = edge.data.sourceParent
    const to = edge.data.targetParent
    if (!from || !to) continue
    outputMap[from] ||= {}
    outputMap[from][edge.source] ||= []
    outputMap[from][edge.source].push({
      fromPortId: edge.source,
      toNodeId: to,
      toPortId: edge.target,
    })
  }
  return outputMap
}

function collectDownstream(startId: string, outputConnections: ReturnType<typeof buildOutputConnections>) {
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    const outConns = outputConnections[current] || {}
    for (const conns of Object.values(outConns)) {
      for (const conn of conns) {
        stack.push(conn.toNodeId)
      }
    }
  }
  return visited
}

function collectExclusiveDownstream(
  startId: string,
  outputConnections: ReturnType<typeof buildOutputConnections>,
  exclusionSet: Set<string>
) {
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (visited.has(current) || exclusionSet.has(current)) continue
    visited.add(current)
    const outConns = outputConnections[current] || {}
    for (const conns of Object.values(outConns)) {
      for (const conn of conns) {
        stack.push(conn.toNodeId)
      }
    }
  }
  return visited
}

function collectUpstream(startIds: string[], inputConns: ReturnType<typeof buildInputConnections>) {
  const visited = new Set<string>()
  const stack = [...startIds]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    const inputs = inputConns[current]
    if (!inputs) continue
    for (const connArr of Object.values(inputs)) {
      for (const conn of connArr) {
        stack.push(conn.fromNodeId)
      }
    }
  }
  return visited
}

function topoSortSafe(
  nodes: Record<string, FlowNode>,
  inputConns: ReturnType<typeof buildInputConnections>,
  customNodeIds: string[],
): string[] {
  const adjacency: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}
  for (const id of customNodeIds) {
    adjacency[id] = []
    inDegree[id] = 0
  }
  for (const [targetId, inputs] of Object.entries(inputConns)) {
    if (!customNodeIds.includes(targetId)) continue
    const allConns = Object.values(inputs).flat()
    for (const { fromNodeId } of allConns) {
      if (!customNodeIds.includes(fromNodeId)) continue
      adjacency[fromNodeId].push(targetId)
      inDegree[targetId]++
    }
  }
  const queue: string[] = []
  for (const id of customNodeIds) {
    if (inDegree[id] === 0) queue.push(id)
  }
  const result: string[] = []
  while (queue.length > 0) {
    const cur = queue.shift()!
    result.push(cur)
    for (const nxt of adjacency[cur]) {
      inDegree[nxt]--
      if (inDegree[nxt] === 0) queue.push(nxt)
    }
  }
  if (result.length < customNodeIds.length) {
    console.warn('⚠️ topoSortSafe 警告：部分节点可能存在循环依赖或未连接：',
      customNodeIds.filter(id => !result.includes(id)))
  }
  return result
}

function isStartNode(json: LangFlowJson, nodeId: string): boolean {
  const node = json.nodes[nodeId]
  return ['ChatInput'].includes(node?.data?.type)
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const sec = Math.floor(ms / 1000)
  const rem = ms % 1000
  return rem > 0 ? `${sec}s ${rem}ms` : `${sec}s`
}
