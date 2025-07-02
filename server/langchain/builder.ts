/**
 * LangFlow/VueFlow DAG 执行核心模块（执行器核心引擎）
 *
 * -----------------------------------------------------------------------------
 * 【算法与工程设计说明】
 * -----------------------------------------------------------------------------
 * 本模块负责对用户可视化配置的工作流（DAG: Directed Acyclic Graph，有向无环图）进行自动化推理与调度执行。
 * 支持以下复杂场景，保证任意复杂流式数据/AI流程的可用性和稳定性：
 * 
 * 1. 【连通子图自动发现】  
 *    - 以所有入口节点（如 APIInput、ChatInput 等，依 runType 匹配）为起点，  
 *    - 利用“无向图广度优先遍历”（Weakly Connected Components, BFS算法）  
 *      自动检索与入口连通的全部节点（弱连通分量），  
 *    - 彻底排除所有与主流程不连通的“孤岛节点”，保持流程图鲁棒性与可维护性。
 * 
 * 2. 【拓扑排序驱动的执行调度】  
 *    - 针对“弱连通分量”内所有节点，基于经典Kahn算法（DAG Topological Sort）执行调度，  
 *    - 动态维护节点的入度表和依赖关系，仅当所有上游节点已完成后才允许节点入队执行，  
 *    - 严格保证所有节点执行顺序完全遵循数据依赖（拓扑序），防止数据未就绪或环路问题。
 *
 * 3. 【分支/循环/工具节点全兼容】
 *    - 支持分支条件（如IfElse节点）、循环执行（loop）、侧挂工具（如APITool等）等高级DAG操作模式，  
 *    - 保证所有依赖满足的节点都能无遗漏执行，且不会破坏主链路顺序。
 *
 * -----------------------------------------------------------------------------
 * 【工程特性与适用场景】
 * -----------------------------------------------------------------------------
 * - 适合VueFlow/LangFlow等可视化AI工作流引擎，  
 * - 任意复杂多入口/多分支/工具节点/主流程可拓扑排序并行执行，  
 * - 支持工程化流程拆分、复用、自动剪枝、可扩展调度等。
 *
 * -----------------------------------------------------------------------------
 * 【术语说明】
 * -----------------------------------------------------------------------------
 * - DAG: Directed Acyclic Graph，有向无环图，保证无环结构可被拓扑排序。
 * - 弱连通分量（Weakly Connected Component）：在无向图意义下，所有通过任意方向边相连的节点集合。
 * - Kahn算法（Kahn's algorithm）：高效的DAG拓扑排序算法，实现依赖驱动调度。
 * - 拓扑序/拓扑排序（Topological Sort）：保证每个节点的所有依赖节点都先于其被执行。
 *
 * -----------------------------------------------------------------------------
 * 【代码作者/维护】
 * @author  KK
 * @since   2025-06
 * -----------------------------------------------------------------------------
 */
import type {
  LangFlowJson,
  LangFlowEdge,
  LangFlowNode,
  DAGStepInfo,
  ExecuteDAGOptions,
  OutputPortVariable,
  BuildContext,
  DAGRunResult
} from '~/types/workflow'
import { collectLoopBodyNodes, contextLogsToSteps } from './utils'
import { initFactories, nodeFactoryMap } from './factories'
import { ChatInputData } from '@/types/node-data/chat-input'

initFactories()

const DEFAULT_HANDLE = '__default'
// function isLoopNode(node: LangFlowNode): boolean {
//   return node.data.type === 'Loop';
// }
/**
 * 构建有向邻接表和入边邻接表（供拓扑排序用）
 */
function buildAdjForTopo(edges: LangFlowEdge[], allowList: Set<string>, nodes: Record<string, LangFlowNode> = {}): { out: Record<string, string[]>, inDegree: Record<string, number> } {
  // 出边（source->target），和入度统计
  const out: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}
  allowList.forEach(id => inDegree[id] = 0)
  edges.forEach(e => {
    // --- ① 过滤 LoopItemResult → Loop 自回线 ------------------
    const tgt = nodes[e.target];
    if (tgt?.data?.type === 'Loop') {

      const resHandle = tgt.data.loopItemResultInputVariable?.id;
      if (e.targetHandle === resHandle) return;   // ← **首轮忽略**
    }
    // ------------------------------------------------------------
    if (!allowList.has(e.source) || !allowList.has(e.target)) return
    out[e.source] ||= []
    out[e.source].push(e.target)
    inDegree[e.target]++
  })
  return { out, inDegree }
}

/**
 * 判断节点是否为“入口节点”
 */
function isStartNode(json: LangFlowJson, nodeId: string, runType: string): boolean {
  const node = json.nodes.find(n => n.id === nodeId)
  if (!node) return false
  const t = node.data?.type
  if (runType === 'api') return t === 'APIInput'
  if (runType === 'chat') return t === 'ChatInput'
  return false
}

/**
 * 无向BFS（弱连通分量遍历）：
 * 从 startNodeIds 出发，遍历所有通过任意连线连通的节点
 */
function getWeaklyConnectedNodeIds(
  startNodeIds: string[],
  edges: LangFlowEdge[]
): Set<string> {
  const neighborMap: Record<string, Set<string>> = {}
  // 构建“无向邻接表”——每条边正反都加
  edges.forEach(e => {
    neighborMap[e.source] ||= new Set()
    neighborMap[e.target] ||= new Set()
    neighborMap[e.source].add(e.target)
    neighborMap[e.target].add(e.source)
  })
  const visited = new Set<string>()
  const queue = [...startNodeIds]
  while (queue.length > 0) {
    const nodeId = queue.shift()!
    if (visited.has(nodeId)) continue
    visited.add(nodeId)
    neighborMap[nodeId]?.forEach(nei => {
      if (!visited.has(nei)) queue.push(nei)
    })
  }
  return visited
}

/**
 * 构建出边/入边邻接表（供输入解析用）
 */
function buildAdj(edges: LangFlowEdge[]) {
  const out: Record<string, Record<string, LangFlowEdge[]>> = {}
  const inp: Record<string, Record<string, LangFlowEdge[]>> = {}
  edges.forEach(e => {
    const sH = e.sourceHandle ?? DEFAULT_HANDLE
    const tH = e.targetHandle ?? DEFAULT_HANDLE
    out[e.source] ||= {}
    out[e.source][sH] ||= []
    out[e.source][sH].push(e)
    inp[e.target] ||= {}
    inp[e.target][tH] ||= []
    inp[e.target][tH].push(e)
  })
  return { out, inp }
}

export async function executeDAG(
  json: LangFlowJson,
  inputMessage: string,
  runType: 'loop' | 'chat' | 'api' = 'chat',
  userId: string,
  workflowId: string,
  opts: ExecuteDAGOptions & {
    maxLoopIterations?: number
    onRunnableElapsed?: (nodeId: string, ms: number) => void
    results?: Record<string, any>
    customNodeIds?: string[]
  } = {}
): Promise<DAGRunResult> {

  const ctx: BuildContext = {
    userId,
    workflowId,
    logs: {},
    resolvedInput: {},
    results: opts.results ?? {},
    json,
    onRunnableElapsed: opts.onRunnableElapsed,
  }
  // const dagSteps: DAGStepInfo[] = []
  let allowList: Set<string> = new Set<string>();
  try {
    // 构建节点字典、邻接表
    const nodes: Record<string, LangFlowNode> = Object.fromEntries(json.nodes.map(n => [n.id, n]))
    const { out: outAdj, inp: inAdj } = buildAdj(json.edges)


    // --------- 第一步：用无向BFS找到所有入口节点可达节点（弱连通分量） -----------

    if (opts.customNodeIds && opts.customNodeIds.length > 0) {
      allowList = new Set(opts.customNodeIds)
    } else {

      /* ⬇️ 这里保持最朴素的“入口 = APIInput / ChatInput”即可  
   *    强行把 Loop 当起点，反而可能让 Loop 节点因为「入度 ≠ 0」永远排不进队列
   */
      const startNodeIds = json.nodes
        .filter(n => isStartNode(json, n.id, runType))   // 只挑 APIInput / ChatInput
        .map(n => n.id);

      allowList = getWeaklyConnectedNodeIds(startNodeIds, json.edges);
      //   裁剪掉所有 loop 节点的 body（customNodeIds）
      //    这样主流程不会调度到它们

      json.nodes.forEach(node => {
        if (node.data.type === 'Loop') {
          const bodyNodeIds = collectLoopBodyNodes(
            json,
            node.id,
            node.data.itemOutputVariable.id,
            node.data.loopItemResultInputVariable.id,
          );
          // console.log('🔄 Loop node', node.id, 'body nodes:', bodyNodeIds);
          bodyNodeIds.forEach(id => {
            // 不要剔除 loop 节点本身
            if (id !== node.id) allowList.delete(id)
          });
        }
      });
    }


    // --------- 第二步：拓扑排序方式依赖执行 -----------
    const { out: topoOut, inDegree } = buildAdjForTopo(json.edges, allowList, nodes)



    // 初始化：入度为0的节点入队（所有依赖都满足，可以执行）
    const queue: string[] = Object.entries(inDegree)
      .filter(([, deg]) => deg === 0)
      .map(([id]) => id)



    const executed = new Set<string>()



    // 跳过分支（IfElse等用到）
    const skip = new Set<string>()
    const markSkipBranch = (start: string) => {
      const stack = [start]
      while (stack.length) {
        const cur = stack.pop()!
        if (skip.has(cur)) continue
        skip.add(cur)


        Object.values(outAdj[cur] || {}).flat().forEach(e => stack.push(e.target))
      }
    }


    // ------- DAG 拓扑主循环 -----------
    while (queue.length > 0) {
      const id = queue.shift()!
      if (!allowList.has(id)) continue
      if (skip.has(id)) continue
      if (executed.has(id)) continue

      const node = nodes[id]



      // 对入口节点赋值 inputMessage
      if (isStartNode(json, id, runType)) {
        if (node.data.type === 'ChatInput') {
          if (node.data.dynamicValue) {
            node.data.inputValue = inputMessage
          }
          console.log(`🔄 ChatInput node ${id} set inputValue:`, node.data.inputValue)
          // (node.data as ChatInputData).inputValue = inputMessage
          // console.log(`🔄 ChatInput node ${id} set inputValue:`, inputMessage)
        } else {
          node.data.inputValue = inputMessage
        }
      }

      // 解析输入（从所有入边取已执行节点的输出，支持多输入）
      const rInput: Record<string, any> = {}
      Object.entries(inAdj[id] || {}).forEach(([tH, edges]) => {
        const vs = edges.map(e => ctx.results[e.source]?.[e.sourceHandle ?? DEFAULT_HANDLE]).filter(v => v !== undefined)
        if (vs.length) rInput[tH] = vs.length === 1 ? vs[0] : vs
      })
      if (Object.keys(rInput).length === 0 && isStartNode(json, id, runType)) rInput[DEFAULT_HANDLE] = inputMessage
      ctx.resolvedInput = rInput






      let output: any
      let error: string | undefined

      try {

        const fac = nodeFactoryMap[node.data.type]
        if (!fac) throw new Error(`Factory not found for ${node.data.type}`)

        output = await fac(node as any, ctx)

      } catch (e) {

        error = (e instanceof Error ? e.message : String(e))
        output = { error }
      }

      ctx.results[id] = output
      opts.onStep?.({
        index: executed.size + 1,
        total: allowList.size,
        nodeId: id,
        nodeTitle: node.data.title,
        nodeType: node.data.type,
        ports: [],
        error: undefined,
        elapsed: 0, // 这里先占位，后面会更新

      } as DAGStepInfo)

      executed.add(id)




      // ----------- IfElse 节点，剪掉未命中的分支 -----------
      if (node.data.type === 'IfElse') {
        const d = node.data as {
          trueOutputVariable: OutputPortVariable;
          falseOutputVariable: OutputPortVariable;

        };
        const cond = !!output.default;           // true / false 分支

        /** 把 “从指定 handle 出去的整条支路” 全部 skip 掉 */
        const skipByHandle = (handleId?: string) => {
          if (!handleId) return;
          // ⚠️ 一定要用 handle → edge → targetId
          (outAdj[id]?.[handleId] || []).forEach(e => markSkipBranch(e.target));
        };

        if (cond) {
          // 命中 true，剪掉 false 侧
          skipByHandle(d.falseOutputVariable?.id);
        } else {
          // 命中 false，剪掉 true 侧
          skipByHandle(d.trueOutputVariable?.id);
        }
      }

      // ------- 拓扑排序推进 -----------
      (topoOut[id] || []).forEach(targetId => {
        inDegree[targetId]--
        if (inDegree[targetId] === 0 && !executed.has(targetId) && !queue.includes(targetId)) {
          queue.push(targetId)
        }
      })


    }
    const finalOutput = resolveFinalOutput(executed, ctx, nodes)
    console.log('🔄 Final output:', finalOutput)


    // console.dir(steps, { depth: null, colors: true })
    return {
      statusCode: 200,
      results: ctx.results,

      logs: contextLogsToSteps(ctx, allowList.size),
      output: finalOutput
    }
  } catch (error) {
    console.error('❌ DAG execution failed:', error)
    // throw error
    return {
      statusCode: 500,
      results: ctx.results,
      // logs: dagSteps,
      logs: contextLogsToSteps(ctx, allowList.size),
      output: '❌ API执行失败:' + (error instanceof Error ? error.message : String(error)),
    }
  }
}


function resolveFinalOutput(
  executed: Set<string>,
  ctx: BuildContext,
  nodes: Record<string, LangFlowNode>
): any {
  const terminalTypes = ['TextOutput', 'ChatOutput']
  const executedList = Array.from(executed)

  const lastTerminalId = executedList.slice().reverse().find(id => {
    const node = nodes[id]
    return node && terminalTypes.includes(node.data.type)
  })

  const lastId = lastTerminalId ?? executedList.at(-1)
  const lastResult = lastId ? ctx.results[lastId] : undefined

  if (lastResult && 'default' in lastResult) {
    return lastResult.default
  } else if (lastResult && typeof lastResult === 'object' && Object.keys(lastResult).length > 0) {
    return lastResult[Object.keys(lastResult)[0]]
  } else {
    return lastResult
  }
}
