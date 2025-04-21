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
  const initialSorted = topoSort(json.nodes, inputConnections, customNodeIds)
  let pending = [...initialSorted]
  const executed = new Set<string>()

  while (pending.length > 0) {
    const nextIdx = pending.findIndex(id => {
      const inputs = inputConnections[id]
      return !inputs || Object.values(inputs).every(conn => executed.has(conn.fromNodeId))
    })

    if (nextIdx === -1) {
      throw new Error('❌ 无法找到可执行节点，可能存在循环依赖或残缺图')
    }

    const nodeId = pending.splice(nextIdx, 1)[0]
    const node = json.nodes[nodeId]

    if (isStartNode(json, node.id)) {
      node.data.inputValue = inputMessage
    }

    const resolvedInput: Record<string, any> = {}
    const connMapForNode = inputConnections[node.id] || {}
    for (const [inputPortId, conn] of Object.entries(connMapForNode)) {
      resolvedInput[inputPortId] = results[conn.fromNodeId]?.[conn.fromPortId]
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

    // ✅ 分支控制
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

      const toRemove = new Set<string>()
      for (const conn of outputConnections[node.id]?.[skipPortNodeId] || []) {
        const downstream = collectDownstream(conn.toNodeId, outputConnections)
        downstream.forEach(id => toRemove.add(id))
      }

      const entryNodeIds =
        outputConnections[node.id]?.[activePortNodeId]?.map(conn => conn.toNodeId) || []

      const activeSet = new Set<string>()
      for (const entry of entryNodeIds) {
        const downstream = collectDownstream(entry, outputConnections)
        downstream.forEach(id => activeSet.add(id))
      }

      const prunedPending = pending.filter(id => !toRemove.has(id))
      const toAdd = [...activeSet].filter(id => !executed.has(id) && !prunedPending.includes(id))

      inputConnections = buildInputConnections(json)
      const extra = topoSort(json.nodes, inputConnections, toAdd)

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


function findPortNodeIdById(
  json: LangFlowJson,
  parentNodeId: string,
  portId: string,
): string | undefined {
  return Object.values(json.nodes).find(
    n => n.data?.parentNode === parentNodeId && n.id === portId
  )?.id
}

function buildInputConnections(json: LangFlowJson) {
  const connections: Record<string, Record<string, { fromNodeId: string; fromPortId: string }>> = {}
  for (const edge of json.edges) {
    const sourceCustomId = edge.data.sourceParent
    const targetCustomId = edge.data.targetParent
    if (!sourceCustomId || !targetCustomId) continue
    connections[targetCustomId] ||= {}
    connections[targetCustomId][edge.target] = {
      fromNodeId: sourceCustomId,
      fromPortId: edge.source,
    }
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

function topoSort(
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
    for (const { fromNodeId } of Object.values(inputs)) {
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
