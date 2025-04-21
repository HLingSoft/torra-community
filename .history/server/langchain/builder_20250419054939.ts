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
  let sortedIds = topoSort(json.nodes, inputConnections, customNodeIds)
  console.log('[DAG] 抽托排序结果:', sortedIds)

  let i = 0
  
  while (i < sortedIds.length) {
    const nodeId = sortedIds[i]
    const node = json.nodes[nodeId]
    const nodeIndex = i + 1

    console.log(`🔗 执行节点 [${nodeIndex}/${sortedIds.length}] ${nodeId} ${node.data.type}`)

    if (isStartNode(json, node.id)) {
      node.data.inputValue = inputMessage
    }

    const resolvedInput: Record<string, any> = {}
    const connMapForNode = inputConnections[node.id] || {}
    for (const [inputPortId, conn] of Object.entries(connMapForNode)) {
      const val = results[conn.fromNodeId]?.[conn.fromPortId]
      resolvedInput[inputPortId] = val
    }

    const factory = nodeFactoryMap[node.data.type]
    if (!factory) throw new Error(`❌ 无法找到工厂: ${node.data.type}`)

    const start = performance.now()
    const factoryOutput = await factory(node, { ...context, resolvedInput })
    const end = performance.now()
    const elapsed = Math.round(end - start)

    results[node.id] = factoryOutput

    options?.onStep?.({
      index: nodeIndex,
      total: sortedIds.length,
      nodeId: node.id,
      type: node.data.type,
      output: factoryOutput,
      outputPreview: '',
      elapsed,
      elapsedStr: formatElapsed(elapsed),
    })

    if (node.data.type === 'IfElse') {
      const isTrueBranch = factoryOutput.default
      console.log('IfElse:', node.id, '分支', isTrueBranch)
    
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
    
      console.log('------------------ IfElse 分支处理 ------------------')
      console.log('activePortNodeId:', activePortNodeId)
    
     // 1. 收集 active 分支节点
const entryNodeIds =
outputConnections[node.id]?.[activePortNodeId]?.map(conn => conn.toNodeId) || []

const activeBranchSet = new Set<string>()
for (const entry of entryNodeIds) {
const downstream = collectDownstream(entry, outputConnections)
downstream.forEach(id => activeBranchSet.add(id))
}

// 2. 收集 skip 分支节点
const rawToRemove = new Set<string>()
for (const conn of outputConnections[node.id]?.[skipPortNodeId] || []) {
const downstream = collectDownstream(conn.toNodeId, outputConnections)
downstream.forEach(id => rawToRemove.add(id))
}

// ✅ 3. 剪枝 = rawToRemove - activeBranchSet
const toRemove = new Set<string>(
[...rawToRemove].filter(id => !activeBranchSet.has(id))
)

// ✅ 4. 执行顺序调整
const executedSet = new Set(sortedIds.slice(0, i + 1))
sortedIds = sortedIds.filter(id => !toRemove.has(id))

// ✅ 5. rebuild connections
inputConnections = buildInputConnections(json)

// ✅ 6. 只补还未执行、未剪掉的 active 分支节点
const branchToExecute = [...activeBranchSet].filter(
id => !executedSet.has(id) && !toRemove.has(id),
)

// ✅ 7. topoSort
const extraNodes = topoSort(json.nodes, inputConnections, branchToExecute)

// ✅ 新增以下
const alreadyExecuted = new Set(sortedIds.slice(0, i + 1))
const allRemaining = new Set([
  ...extraNodes,
  ...sortedIds.slice(i + 1).filter(id => !alreadyExecuted.has(id)),
])
const fullRemaining = topoSort(json.nodes, inputConnections, [...allRemaining])

sortedIds = [...sortedIds.slice(0, i + 1), ...fullRemaining]
console.log('[IfElse] rawToRemove:', [...rawToRemove])
console.log('[IfElse] activeBranchSet:', [...activeBranchSet])
console.log('[IfElse] final toRemove:', [...toRemove])
    
      console.log('skipPortNodeId:', skipPortNodeId)
      console.log('outputConnections[node.id]:', outputConnections[node.id])
      console.log('Gp5NML 被剪了么？', toRemove.has('Gp5NML-ccinuPfa8udwyD'))
    
      console.log('toRemove:', [...toRemove])
      console.log('executedSet:', [...executedSet])
      console.log('activeBranchSet:', [...activeBranchSet])
      console.log('branchToExecute:', branchToExecute)
    
      console.log('[IfElse] 剪枝:', skipPortNodeId, '分支', toRemove)
      console.log('[IfElse] 补全分支:', activePortNodeId, extraNodes)
    }
    

    i++
  }

  const lastNodeId = sortedIds[sortedIds.length - 1]
  const lastNode = json.nodes[lastNodeId]
  const lastNodeResult = results[lastNodeId]
  const lastNodeResultValue =
    lastNodeResult.default ||
    lastNodeResult[lastNode.data?.outputVariable?.id] ||
    Object.values(lastNodeResult)[0] ||
    '未设置默认值'

  console.log('🟢 最终输出:', lastNodeResultValue)

  return {
    results,
    output: lastNodeResultValue,
  }
}

function findPortNodeIdById(
  json: LangFlowJson,
  parentNodeId: string,
  portId: string,
): string | undefined {
  return Object.values(json.nodes).find(
    (n) => n.data?.parentNode === parentNodeId && n.id === portId
  )?.id
}

function buildInputConnections(json: LangFlowJson) {
  const connections: Record<string, Record<string, { fromNodeId: string; fromPortId: string }>> = {}

  for (const edge of json.edges) {
    const sourcePortNode = json.nodes[edge.source]
    const targetPortNode = json.nodes[edge.target]
    const sourceCustomId = edge.data.sourceParent
    const targetCustomId = edge.data.targetParent
    if (!sourcePortNode || !targetPortNode || !sourceCustomId || !targetCustomId) continue

    connections[targetCustomId] ||= {}
    connections[targetCustomId][targetPortNode.id] = {
      fromNodeId: sourceCustomId,
      fromPortId: sourcePortNode.id,
    }
  }
  return connections
}

function buildOutputConnections(json: LangFlowJson) {
  const outputMap: Record<
    string,
    Record<string, { fromPortId: string; toNodeId: string; toPortId: string }[]>
  > = {}

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
