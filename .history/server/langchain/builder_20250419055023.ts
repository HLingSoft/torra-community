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

  let executed = new Set<string>()
  let pending = Object.keys(json.nodes).filter(id => json.nodes[id].type === 'custom')
  
  while (pending.length > 0) {
    // 找下一个可执行节点（所有依赖都已执行）
    const nextIdx = pending.findIndex(id => {
      const inputs = inputConnections[id]
      return !inputs || Object.values(inputs).every(conn => executed.has(conn.fromNodeId))
    })
  
    if (nextIdx === -1) {
      throw new Error('❌ DAG 死锁：找不到可执行节点，可能存在循环依赖或分支逻辑剪错')
    }
  
    const nodeId = pending.splice(nextIdx, 1)[0]
    const node = json.nodes[nodeId]
    const nodeIndex = executed.size + 1
  
    console.log(`🔗 执行节点 [${nodeIndex}] ${nodeId} ${node.data.type}`)
  
    if (isStartNode(json, nodeId)) {
      node.data.inputValue = inputMessage
    }
  
    const resolvedInput: Record<string, any> = {}
    const connMap = inputConnections[nodeId] || {}
    for (const [inputPortId, conn] of Object.entries(connMap)) {
      resolvedInput[inputPortId] = results[conn.fromNodeId]?.[conn.fromPortId]
    }
  
    const factory = nodeFactoryMap[node.data.type]
    if (!factory) throw new Error(`❌ 工厂未注册: ${node.data.type}`)
  
    const start = performance.now()
    const output = await factory(node, { ...context, resolvedInput })
    const end = performance.now()
  
    results[nodeId] = output
    executed.add(nodeId)
  
    options?.onStep?.({
      index: nodeIndex,
      total: 0,
      nodeId,
      type: node.data.type,
      output,
      outputPreview: '',
      elapsed: Math.round(end - start),
      elapsedStr: formatElapsed(Math.round(end - start)),
    })
  
    // ✅ IfElse 分支处理
    if (node.data.type === 'IfElse') {
      const isTrueBranch = output.default === true
      const skipPort = isTrueBranch ? node.data.falseOutputVariable.id : node.data.trueOutputVariable.id
      const activePort = isTrueBranch ? node.data.trueOutputVariable.id : node.data.falseOutputVariable.id
  
      const skipPortNodeId = findPortNodeIdById(json, nodeId, skipPort)
      const activePortNodeId = findPortNodeIdById(json, nodeId, activePort)
      if (!skipPortNodeId || !activePortNodeId) {
        throw new Error(`❌ IfElse 节点 ${nodeId} 的端口 ID 找不到`)
      }
  
      // ❌ 这些 downstream 会被剪掉
      const toRemove = new Set<string>()
      for (const conn of outputConnections[nodeId]?.[skipPortNodeId] || []) {
        const downstream = collectDownstream(conn.toNodeId, outputConnections)
        downstream.forEach(id => toRemove.add(id))
      }
  
      // ✅ 这些 downstream 是保留的
      const activeSet = new Set<string>()
      for (const conn of outputConnections[nodeId]?.[activePortNodeId] || []) {
        const downstream = collectDownstream(conn.toNodeId, outputConnections)
        downstream.forEach(id => activeSet.add(id))
      }
  
      // ✅ 实时剪掉不应该执行的节点
      pending = pending.filter(id => !toRemove.has(id))
  
      console.log(`[IfElse] ${nodeId} 分支 ${isTrueBranch ? 'true' : 'false'}`)
      console.log('toRemove:', [...toRemove])
      console.log('activeSet:', [...activeSet])
      console.log('pending 剩余:', pending)
    }
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
