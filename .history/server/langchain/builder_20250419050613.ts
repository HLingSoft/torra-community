import type { FlowNode, LangFlowJson } from '~/types/workflow'
import type { DAGStepInfo } from '~/types/ws'
import { initFactories, nodeFactoryMap } from './factories'

initFactories()

type DAGContext = Record<string, any>
type NodeResultsMap = Record<string, Record<string, any>>

interface ExecuteDAGOptions {
  onStep?: (step: DAGStepInfo) => void
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

  const inputConnections = buildInputConnections(json)
  const outputConnections = buildOutputConnections(json)

  const customNodeIds = Object.keys(json.nodes).filter(id => json.nodes[id].type === 'custom')
  let sortedIds = topoSort(json.nodes, inputConnections, customNodeIds)
  console.log('[DAG] 拓扑排序结果:', sortedIds)
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
      const isTrueBranch = factoryOutput.true === true
      console.log('IfElse:', node.id, '分支', isTrueBranch)
    
      const skipPortId = isTrueBranch
        ? node.data.falseOutputVariable.id
        : node.data.trueOutputVariable.id
    
      const toRemove = new Set<string>()
    
      for (const conn of outputConnections[node.id]?.[skipPortId] || []) {
        const downstream = collectDownstream(conn.toNodeId, outputConnections)
        downstream.forEach(id => toRemove.add(id))
      }
    
      // ✅ 1. 裁剪原有的 sortedIds
      sortedIds = sortedIds.filter(id => !toRemove.has(id))
    
      // ✅ 2. 把已执行的节点做一个集合
      const executedSet = new Set(sortedIds.slice(0, i + 1))
    
      // ✅ 3. 构建剩余节点的拓扑顺序（保证 false 分支还会继续执行）
      const remainingNodeIds = Object.keys(json.nodes)
        .filter(id => json.nodes[id].type === 'custom' && !executedSet.has(id))
    
      const tailSorted = topoSort(json.nodes, buildInputConnections(json), remainingNodeIds)
    
      // ✅ 4. 拼接回来（插入当前 IfElse 节点之后）
      sortedIds = [...sortedIds.slice(0, i + 1), ...tailSorted]
    
      console.log('[IfElse] 剪枝:', skipPortId, '分支', toRemove)
    }
    i++
  }

  const lastNodeId = sortedIds[sortedIds.length - 1]
  const lastNode = json.nodes[lastNodeId]
  const lastNodeResult = results[lastNodeId]
  const lastNodeResultValue =
    lastNodeResult.default ||
    lastNodeResult[lastNode.data?.outputVariable?.id] ||
    '未设置默认值'

  console.log('🟢 最终输出:', lastNodeResultValue)

  return {
    results,
    output: lastNodeResultValue,
  }
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
