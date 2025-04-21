/***********************************************************
 * build.ts
 * DAG 执行器 (采用拓扑排序保证节点顺序)
 *
 * 核心思路：
 * 1. 首先 buildInputConnections(json)，得到下游 -> 上游依赖
 * 2. 对所有 custom 节点做拓扑排序(确保上游先执行)
 
 ***********************************************************/

import type { FlowNode, LangFlowJson } from '~/types/workflow'
import type { DAGStepInfo } from '~/types/ws'
import { initFactories, nodeFactoryMap } from './factories'
 
// 初始化节点工厂注册
initFactories()
 

/** 执行上下文，可存放全局数据 */
type DAGContext = Record<string, any>

/** 每个节点执行后，存 { [portId]: RunnableLike } 或包装的值 */
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
  console.log('json',json)
  // pruneDisconnectedCustomNodes(json)
 
 

  const inputConnections = buildInputConnections(json)

  const customNodeIds = Object.keys(json.nodes).filter(id => json.nodes[id].type === 'custom')
 
  let sortedIds = topoSort(json.nodes, inputConnections, customNodeIds)
  console.log('[DAG] 拓扑排序结果:', sortedIds)
  // const terminalNodes = findTerminalNodes(json)
  // let finalMessage = ''
 
  for (let i = 0; i < sortedIds.length; i++) {
   
    const nodeId = sortedIds[i]
    const node = json.nodes[nodeId]
    console.log(`🔗 执行节点 [${i + 1}/${sortedIds.length}] ${sortedIds[i]} ${node.data.type}`)
    const nodeIndex = i + 1
    if (isStartNode(json, node.id)) {
      node.data.inputValue = inputMessage
    }
    // console.log(1)
    const resolvedInput: Record<string, any> = {}
    const connMapForNode = inputConnections[node.id] || {}
    // console.log(`🔗 [${node.id}](${node.data.type}) 连接:`, connMapForNode)
    for (const [inputPortId, conn] of Object.entries(connMapForNode)) {

      const { fromNodeId, fromPortId } = conn
     
      const upstreamRunnable = results[fromNodeId][fromPortId]
      
        resolvedInput[inputPortId] = upstreamRunnable
      
    }
    
 
   
    // console.log(5)
    const factory = nodeFactoryMap[node.data.type]
    // console.log('factory',node.data.type,factory)
    if (!factory) {
      throw new Error(`❌ 无法找到工厂: ${node.data.type}`)
    }
    const start = performance.now()
    // console.log(`🔗 [${node.id}](${node.data.type}) 变量:`)
    const factoryOutput = await factory(node, { ...context, resolvedInput })
    // console.log(`🔗 [${node.id}](${node.data.type}) 变量:`, factoryOutput)
    
   

    
    results[node.id] = factoryOutput
    const end = performance.now()
    const elapsed = Math.round(end - start) // 单位：ms，四舍五入

    options?.onStep?.({
      index: nodeIndex,
      total: sortedIds.length,
      nodeId: node.id,
      type: node.data.type,
      output: factoryOutput,
      // outputPreview: extractFinalMessage(nodeResult),
      outputPreview:'',
      elapsed,
      elapsedStr: formatElapsed(elapsed),
    })
    // if (node.data.type === 'IfElse') {
    //   const isTrueBranch = factoryOutput.true === true
    //   const skipPort = isTrueBranch ? 'false' : 'true'
      
    //   // 找出 false 分支的所有 downstream 节点
    //   const toRemove = new Set<string>()
    //   for (const conn of outputConnections[node.id]?.[skipPort] || []) {
    //     const downstream = collectDownstream(conn.toNodeId)
    //     downstream.forEach(id => toRemove.add(id))
    //   }
    
    //   // 裁剪 sortedIds
    //   sortedIds = sortedIds.filter(id => !toRemove.has(id))
    // }
   
    
  }
 
  
   //获取results 最后一个记录
  const lastNodeId = sortedIds[sortedIds.length - 1]
  const lastNode = json.nodes[lastNodeId]
  console.log('lastNode',lastNode.data.type)
  const lastNodeResult = results[lastNodeId]
  const lastNodeResultValue = lastNodeResult.default || lastNodeResult[lastNode.data?.outputVariable?.id]  ||'未设置默认值'

  console.log('🟢 最终输出:', lastNodeResultValue)

  return {
    results,
    output: lastNodeResultValue, //results 最后一个记录
    // outputs: mergedOutputs, // 👈 bonus: 全部终止节点输出
  }
}
 

function buildInputConnections(json: LangFlowJson) {
  const connections: Record<string, Record<string, { fromNodeId: string, fromPortId: string }>> = {}

  for (const edge of json.edges) {
    const sourcePortNode = json.nodes[edge.source]
    const targetPortNode = json.nodes[edge.target]
    const sourceCustomId = edge.data.sourceParent
    const targetCustomId = edge.data.targetParent
    if (!sourcePortNode || !targetPortNode || !sourceCustomId || !targetCustomId) {
      continue
    }
    connections[targetCustomId] ||= {}
    connections[targetCustomId][targetPortNode.id] = {
      fromNodeId: sourceCustomId,
      fromPortId: sourcePortNode.id,
    }
  }
  return connections
}
 
/**
 * 对 custom 节点做拓扑排序：确保上游先执行，下游后执行。
 * @param nodes - 全部节点记录
 * @param inputConns - buildInputConnections() 返回的依赖
 * @param customNodeIds - 仅关心 type=custom 的 nodeId
 */
function topoSort(
  nodes: Record<string, FlowNode>,
  inputConns: ReturnType<typeof buildInputConnections>,
  customNodeIds: string[],
): string[] {
  // adjacency: nodeId -> 下游节点列表
  const adjacency: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}

  // 初始化
  for (const id of customNodeIds) {
    adjacency[id] = []
    inDegree[id] = 0
  }

  // 构建有向图 & 统计 inDegree
  for (const [targetId, inputs] of Object.entries(inputConns)) {
    if (!customNodeIds.includes(targetId)) {
      continue
    }
    for (const { fromNodeId } of Object.values(inputs)) {
      if (!customNodeIds.includes(fromNodeId)) {
        continue
      }

      adjacency[fromNodeId].push(targetId)
      inDegree[targetId]++
    }
  }

  // 找出 inDegree = 0 的节点
  const queue: string[] = []
  for (const id of customNodeIds) {
    if (inDegree[id] === 0) {
      queue.push(id)
    }
  }

  const result: string[] = []

  // Kahn 算法
  while (queue.length > 0) {
    const cur = queue.shift()!
    result.push(cur)
    for (const nxt of adjacency[cur]) {
      inDegree[nxt]--
      if (inDegree[nxt] === 0) {
        queue.push(nxt)
      }
    }
  }

  // 若 result.length < customNodeIds.length, 说明有环or不完整
  // 这里简单返回, 也可以做额外检查
  return result
}

function isStartNode(json: LangFlowJson, nodeId: string): boolean {
  const node = json.nodes[nodeId]
  // , 'TextInput', 'QuestionInput'
  return ['ChatInput'].includes(node?.data?.type)
}





// function hasDownstream(json: LangFlowJson, nodeId: string): boolean {
//   return json.edges.some(edge => getParentNodeId(json, edge.source) === nodeId)
// }

 
// function findTerminalNodes(json: LangFlowJson): FlowNode[] {
//   const preferredTypes = ['ChatOutput']

//   const candidates = Object.values(json.nodes).filter(n => n.type === 'custom')

//   // 优先找带输出含义的
//   const preferred = candidates.filter(n => preferredTypes.includes(n.data?.type))
//   if (preferred.length) return preferred

//   // fallback 到没有下游的
//   return candidates.filter(n => !hasDownstream(json, n.id))
// }

function getParentNodeId(json: LangFlowJson, portNodeId: string): string | undefined {
  const portNode = json.nodes[portNodeId]
  return portNode?.data?.parentNode
}

/**
 * 清理无连接的 custom 节点
 */
function pruneDisconnectedCustomNodes(json: LangFlowJson): void {
 

  const reachable = new Set<string>()

  // 构建：节点 -> 下游 custom 节点 的映射
  const graph: Record<string, string[]> = {}
  for (const edge of json.edges) {
    const from = edge.data.sourceParent
    const to = edge.data.targetParent
    if (from && to) {
      if (!graph[from]) graph[from] = []
      graph[from].push(to)
    }
  }

  // 从 ChatInput 出发，DFS 找到所有可达的 custom 节点
  function dfs(nodeId: string) {
    if (reachable.has(nodeId)) return
    reachable.add(nodeId)
    for (const next of graph[nodeId] || []) {
      dfs(next)
    }
  }

  // 找到所有 ChatInput 节点作为入口
  const chatInputs = Object.values(json.nodes)
    .filter(n => n.type === 'custom' && n.data?.type === 'ChatInput')
    .map(n => n.id)

  for (const startId of chatInputs) {
    dfs(startId)
  }

  // 删除不可达的 custom 节点及其 port 子节点
  for (const node of Object.values(json.nodes)) {
    if (node.type === 'custom' && !reachable.has(node.id)) {
      delete json.nodes[node.id]
      for (const port of Object.values(json.nodes)) {
        if (port.data?.parentNode === node.id) {
          delete json.nodes[port.id]
        }
      }
    }
  }

  // 同时也需要把 edges 过滤掉无效连接
  json.edges = json.edges.filter(edge => {
    return reachable.has(edge.data.sourceParent) && reachable.has(edge.data.targetParent)
  })
}
 


function formatElapsed(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  const sec = Math.floor(ms / 1000)
  const rem = ms % 1000
  return rem > 0 ? `${sec}s ${rem}ms` : `${sec}s`
}
