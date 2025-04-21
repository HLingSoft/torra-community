/***********************************************************
 * build.ts
 * DAG 执行器 (采用拓扑排序保证节点顺序)
 *
 * 核心思路：
 * 1. 首先 buildInputConnections(json)，得到下游 -> 上游依赖
 * 2. 对所有 custom 节点做拓扑排序(确保上游先执行)
 * 3. 依次执行每个节点的工厂，返回 { [portId]: Runnable } 或 { [portId]: any } 包装
 * 4. 在执行尾部(终止节点) .invoke() 取得最终输出
 ***********************************************************/

import type { FlowNode, LangFlowJson } from '~/types/workflow'
import type { DAGStepInfo } from '~/types/ws'
import { initFactories, nodeFactoryMap } from './factories'

// 初始化节点工厂注册
initFactories()

/** RunnableLike: 带有 invoke 方法的 LangChain 对象 */
interface RunnableLike {
  invoke: (input: any) => Promise<any> | any
}

function isRunnable(obj: any): obj is RunnableLike {
  return obj && typeof obj.invoke === 'function'
}

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
// console.log('json',json)
  pruneDisconnectedCustomNodes(json)

 

  const inputConnections = buildInputConnections(json)

  const customNodeIds = Object.keys(json.nodes).filter(id => json.nodes[id].type === 'custom')
 
  const sortedIds = topoSort(json.nodes, inputConnections, customNodeIds)
  console.log('[DAG] 拓扑排序结果:', sortedIds)
 
  for (let i = 0; i < sortedIds.length; i++) {
    console.log(`🔗 执行节点 [${i + 1}/${sortedIds.length}] ${sortedIds[i]}`)
    const nodeId = sortedIds[i]
    const node = json.nodes[nodeId]
    const nodeIndex = i + 1
    if (isStartNode(json, node.id)) {
      node.data.inputValue = inputMessage
    }
    // console.log(1)
    const resolvedInput: Record<string, any> = {}
    const connMapForNode = inputConnections[node.id] || {}

    for (const [inputPortId, conn] of Object.entries(connMapForNode)) {
      const { fromNodeId, fromPortId } = conn
      if (!results[fromNodeId]) {
        console.warn(`⚠️ 上游节点 [${fromNodeId}] 尚未执行或没有结果，无法传给 [${node.id}]`)
        continue
      }
      // console.log(2)

      // ✨这里是核心修复，明确调用上游 invoke()
      const upstreamRunnable = results[fromNodeId][fromPortId]
      // resolvedInput[inputPortId]=upstreamRunnable
      // console.log(3)
      // // console.log('isRunnable',upstreamRunnable,isRunnable(upstreamRunnable),await upstreamRunnable.invoke({}))
      resolvedInput[inputPortId] = isRunnable(upstreamRunnable)
        ? await upstreamRunnable.invoke({})
        : upstreamRunnable
        // console.log(4)
      // console.log(`🔗 [${node.id}](${node.data.type}) 端口 [${inputPortId}] 上游 [${fromNodeId}](${json.nodes[fromNodeId].data.type}) 结果:`, resolvedInput[inputPortId])
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
    
    // const nodeResult: Record<string, RunnableLike> ={}

    
    // for (const [portId, output] of Object.entries(factoryOutput)) {
    //   // console.log(`🔗 [${node.id}](${node.data.type}) 端口 [${portId}] 执行结果:`)
    //   const runnableLike = isRunnable(output)
    //     ? output
    //     : { invoke: async () => output }

    //     // console.log(`🔗 [${node.id}](${node.data.type}) 端口 [${portId}] 执行结果:`, await runnableLike.invoke)
    
    //   // 包裹 invoke 计时
    //   nodeResult[portId] = 
    //   {
    //     invoke: async   (...args: any[]) => {
    //       // const invokeStart = performance.now()
    //       const result = await (runnableLike.invoke as (...args: any[]) => any)(...args)
    //       // console.log(`🔗 [${node.id}](${node.data.type}) 端口 [${portId}] 执行结果:`, result)
    //       // const invokeEnd = performance.now()
    //       // const elapsed = Math.round(invokeEnd - invokeStart)
    
    //       // console.log(`⏱️ invoke 执行耗时 [${node.id}.${portId}]: ${elapsed}ms`)
    //       return result
    //     },
    //   }
    // }
    // console.log('nodeResult',nodeResult)
    // results[node.id] = nodeResult
    const end = performance.now()
    const elapsed = Math.round(end - start) // 单位：ms，四舍五入

    options?.onStep?.({
      index: nodeIndex,
      total: sortedIds.length,
      nodeId: node.id,
      type: node.data.type,
      // output: nodeResult,
      outputPreview: extractFinalMessage(nodeResult),
      elapsed,
      elapsedStr: formatElapsed(elapsed),
    })
   

    console.log(`✅ 执行节点 [${node.id}](${node.data.type}) 得到结果:`, nodeResult)
  }

  const terminalNodes = findTerminalNodes(json)
  console.log('🟢 终止节点:', terminalNodes.map(n => `${n.id} (${n.data?.type})`))
  
  const mergedOutputs: Record<string, any> = {}
  
  for (const node of terminalNodes) {
    const outputMap = results[node.id] || {}
    const outputPorts = node.data?.outputVariables?.map((v: any) => v.id)
      ?? (node.data?.outputVariable?.id ? [node.data.outputVariable.id] : Object.keys(outputMap))
  
    for (const portId of outputPorts) {
      const runnable = outputMap[portId]
      if (!runnable) continue
  
      try {
        const result = isRunnable(runnable) ? await runnable.invoke({}) : runnable
        mergedOutputs[`${node.data?.type || node.id}.${portId}`] = result
      } catch (err) {
        console.error(`❌ invoke(${node.id}.${portId}) 出错:`, err)
        mergedOutputs[`${node.data?.type || node.id}.${portId}`] = '[Error]'
      }
    }
  }
  
  // ✅ 自动从 mergedOutputs 中提取一个主要文本输出（用于展示）
  const finalMessage = extractFinalMessage(mergedOutputs)
  console.log('🟢 最终输出:', finalMessage)
  
  return {
    results,
    output: finalMessage,
    outputs: mergedOutputs, // 👈 bonus: 全部终止节点输出
  }
}
 
/**
 * 构建 \"下游 CustomNode -> { inputPortId -> (上游CustomNode,上游PortId) }\" 的依赖映射
 */
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

function hasDownstream(json: LangFlowJson, nodeId: string): boolean {
  return json.edges.some(edge => getParentNodeId(json, edge.source) === nodeId)
}

function isTerminalNode(json: LangFlowJson, nodeId: string): boolean {
  return !hasDownstream(json, nodeId)
}

// function findTerminalNode(json: LangFlowJson): FlowNode | undefined {
//   return Object.values(json.nodes)
//     .reverse()
//     .find(n => n.type === 'custom' && isTerminalNode(json, n.id))
// }
function findTerminalNodes(json: LangFlowJson): FlowNode[] {
  const preferredTypes = ['ChatOutput', 'TextOutput', 'Output']

  const candidates = Object.values(json.nodes).filter(n => n.type === 'custom')

  // 优先找带输出含义的
  const preferred = candidates.filter(n => preferredTypes.includes(n.data?.type))
  if (preferred.length) return preferred

  // fallback 到没有下游的
  return candidates.filter(n => !hasDownstream(json, n.id))
}

function getParentNodeId(json: LangFlowJson, portNodeId: string): string | undefined {
  const portNode = json.nodes[portNodeId]
  return portNode?.data?.parentNode
}

/**
 * 清理无连接的 custom 节点
 */
function pruneDisconnectedCustomNodes(json: LangFlowJson): void {
  const nodesToDelete = new Set<string>()
  for (const node of Object.values(json.nodes)) {
    if (node.type === 'custom') {
      const childPorts = Object.values(json.nodes).filter(n => n.data.parentNode === node.id)
      const connected = json.edges.some(edge =>
        childPorts.some(p => edge.source === p.id || edge.target === p.id),
      )
      if (!connected) {
        nodesToDelete.add(node.id)
        childPorts.forEach(p => nodesToDelete.add(p.id))
      }
    }
  }
  for (const nodeId of nodesToDelete) {
    delete json.nodes[nodeId]
  }
}
 


function extractFinalMessage(output: unknown): string {
  if (!output) {
    return ''
  }

  // ✅ 如果是字符串，直接返回
  if (typeof output === 'string') {
    return output
  }

  // ✅ LangChain Message 类型
  if ((output as any)?.constructor?.name === 'HumanMessage' && typeof (output as any).content === 'string') {
    return (output as any).content
  }

  if ((output as any)?.constructor?.name === 'AIMessage' && typeof (output as any).content === 'string') {
    return (output as any).content
  }

  // ✅ PromptValue 类型
  if ((output as any)?.constructor?.name === 'StringPromptValue' && typeof (output as any).value === 'string') {
    return (output as any).value
  }

  // ✅ 可调用对象，不执行，仅标注
  if (isRunnable(output)) {
    return '[Runnable object]'
  }

  // ✅ 多端口结果时（例如 { port1: val1, port2: val2 }）
  const values = Object.values(output as Record<string, unknown>)
  if (!values.length) {
    return ''
  }

  const first = values[0]

  if (typeof first === 'string') {
    return first
  }

  if (first && typeof first === 'object') {
    const val = first as Record<string, any>
    if (typeof val.content === 'string') {
      return val.content
    }
    if (typeof val.value === 'string') {
      return val.value
    }
    if (typeof val.message === 'string') {
      return val.message
    }
    return JSON.stringify(val)
  }

  return String(first ?? '')
}
function formatElapsed(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  const sec = Math.floor(ms / 1000)
  const rem = ms % 1000
  return rem > 0 ? `${sec}s ${rem}ms` : `${sec}s`
}
