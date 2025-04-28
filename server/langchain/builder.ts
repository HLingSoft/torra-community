import type { FlowNode, LangFlowJson, NodeResultsMap, BuildContext } from '~/types/workflow'
import type { DAGStepInfo } from '~/types/ws'
import { initFactories, nodeFactoryMap } from './factories'
import { ChatInputData } from '~/types/node-data/chat-input'

initFactories()

// type BuildContext = Record<string, any>
// type NodeResultsMap = Record<string, Record<string, any>>
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
  runType = 'chat',// chat or api
  options?: ExecuteDAGOptions,
) {

  const results: NodeResultsMap = {}
  const context: Omit<BuildContext, 'resolvedInput'> = {
    results,
    json,
    onRunnableElapsed,
  }
  context.results = results
  context.json = json


  const nodeStatus = new Map<string, 'pending' | 'completed' | 'skipped'>()
  const stepCache = new Map<string, { index: number; total: number; type: string }>()

  function onRunnableElapsed(nodeId: string, ms: number) {
    nodeStatus.set(nodeId, 'completed')  // ✅ 这里更新状态

    const cache = stepCache.get(nodeId)

    options?.onStep?.({
      index: cache?.index ?? 0,
      total: cache?.total ?? 0,
      nodeId,
      type: cache?.type ?? 'unknown',
      elapsed: ms,
      elapsedStr: formatElapsed(ms),
      output: results[nodeId],
      outputPreview: '',
    })
  }
  let inputConnections = buildInputConnections(json)
  const outputConnections = buildOutputConnections(json)
  // console.log(JSON.stringify(json, null, 2))
  const customNodeIds = Object.keys(json.nodes).filter(id => json.nodes[id].type === 'custom')
  const initialSorted = topoSortSafe(json.nodes, inputConnections, customNodeIds)
  let pending = [...initialSorted]
  const executed = new Set<string>()
  const keepSet = new Set<string>()   // 永久保留的节点



  while (pending.length > 0) {
    const nextIdx = pending.findIndex(id => {
      const inputs = inputConnections[id]
      return (
        !inputs ||
        Object.values(inputs).every(connArr =>
          connArr.length === 0 || connArr.some(conn => executed.has(conn.fromNodeId))
        )
      )
    })

    if (nextIdx === -1) {
      throw new Error('❌ 无法找到可执行节点，可能存在循环依赖或残缺图')
    }

    const nodeId = pending.splice(nextIdx, 1)[0]
    const node = json.nodes[nodeId]

    console.log(`🔗 执行节点 [${executed.size + 1}/${initialSorted.length}] ${nodeId} ${node.data.type}`)

    if (isStartNode(json, node.id, runType)) {

      if (node.data.type === 'ChatInput') {
        const data = node.data as ChatInputData
        if (data.dynamicValue) {
          node.data.inputValue = inputMessage
        }

      } else {
        node.data.inputValue = inputMessage
      }

      console.log(`当前是开始节点  ${nodeId} ${node.data.type}`, runType, node.data.inputValue)
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


    const t0 = performance.now()              // 开始计时（保留）
    const ctxForNode: BuildContext = {
      ...context,
      resolvedInput,
    }
    const buildMs = performance.now() - t0    // factory 本身耗时
    const factoryOutput = await factory(node, ctxForNode)

    // const buildMs = 0.5// 统一以1ms展示build
    // const end = performance.now()
    // const elapsed = Math.round(end - start)

    results[node.id] = factoryOutput
    executed.add(node.id)


    const hasRunnable = Object.values(factoryOutput).some(hasInvoke)

    if (hasRunnable) {
      nodeStatus.set(node.id, 'pending')
    } else {
      nodeStatus.set(node.id, 'completed')
    }

    options?.onStep?.({
      index: executed.size,
      total: initialSorted.length,
      nodeId: node.id,
      type: node.data.type,
      elapsed: hasRunnable ? -1 : buildMs,
      elapsedStr: hasRunnable ? 'Pending' : formatElapsed(buildMs),
      output: factoryOutput,
      outputPreview: '',
    })

    /* 把 index / total / type 存进缓存，供二次 push 用 */
    stepCache.set(node.id, {
      index: executed.size,
      total: initialSorted.length,
      type: node.data.type,
    })



    // ✅ IfElse 分支控制逻辑（最终版：严格只保留选中分支路径）
    if (node.data.type === 'IfElse') {
      const isTrueBranch = factoryOutput.default === true
      const skipPortId = isTrueBranch
        ? node.data.falseOutputVariable.id
        : node.data.trueOutputVariable.id
      const activePortId = isTrueBranch
        ? node.data.trueOutputVariable.id
        : node.data.falseOutputVariable.id

      const skipEntryIds = outputConnections[node.id]?.[skipPortId]?.map(conn => conn.toNodeId) || []
      const activeEntryIds = outputConnections[node.id]?.[activePortId]?.map(conn => conn.toNodeId) || []

      // ✅ activeSet = 从 false/true 分支入口出发，向下收集整条路径
      const activeSet = new Set<string>()
      for (const id of activeEntryIds) {
        collectDownstream(id, outputConnections).forEach(i => {
          activeSet.add(i)
          keepSet.add(i)          // ← 关键：写进全局保护集
        })
      }

      // ✅ toRemove = 从 skip 分支入口出发，收集整条路径（不做对比，全部删）
      const toRemove = new Set<string>()
      for (const id of skipEntryIds) {
        collectDownstream(id, outputConnections).forEach(i => {
          if (!keepSet.has(i)) toRemove.add(i)
        })
      }

      for (const id of toRemove) {
        Object.values(results[id] ?? {}).forEach(v => {
          if (typeof v?.invokeIfAvailable === 'function' && v.elapsed === -1) {
            v.invokeIfAvailable = async () => null   // 永久失效
          }
        })
        if (!keepSet.has(id)) {
          nodeStatus.set(id, 'skipped')
          options?.onStep?.({
            index: stepCache.get(id)?.index ?? 0,
            total: stepCache.get(id)?.total ?? 0,
            nodeId: id,
            type: json.nodes[id].data.type ?? 'unknown',
            elapsed: -2, // 特殊标记 skipped
            elapsedStr: 'Skipped',
            output: '',
            outputPreview: '',
          })
        }
      }
      // ❌ 把 skip 分支节点全部从待执行列表移除
      // const prunedPending = pending.filter(id => !toRemove.has(id))
      // const toAdd = [...activeSet].filter(id => !executed.has(id) && !prunedPending.includes(id))
      // 更新 pending
      pending = pending.filter(id => !toRemove.has(id))
      const needAdd = [...activeSet].filter(id =>
        !executed.has(id) && !pending.includes(id)
      )
      inputConnections = buildInputConnections(json)
      pending.push(...topoSortSafe(json.nodes, inputConnections, needAdd))

      console.log(`[IfElse] ${node.id} 分支`, isTrueBranch)
      console.log('toRemove:', [...toRemove])
      console.log('activeSet:', [...activeSet])

      console.log('待执行节点:', pending)
    }



  }

  for (const [nodeId, status] of nodeStatus.entries()) {
    if (status === 'pending' && !executed.has(nodeId)) {   // ✅ 注意必须 !executed
      const outputs = results[nodeId]
      const outputValues = outputs ? Object.values(outputs) : []

      const stillPending = outputValues.every(val =>
        typeof val?.invokeIfAvailable === 'function' &&
        val.elapsed === -1
      )

      if (stillPending) {
        nodeStatus.set(nodeId, 'skipped')

        const cache = stepCache.get(nodeId)
        console.warn(`⚠️ 节点 ${nodeId} 被跳过，可能是因为没有输入或未连接`)

        options?.onStep?.({
          index: cache?.index ?? 0,
          total: cache?.total ?? 0,
          nodeId,
          type: cache?.type ?? 'unknown',
          elapsed: -2,
          elapsedStr: 'Skipped',
          output: '',
          outputPreview: '',
        })

      }
    }
  }

  for (const nodeId of executed) {
    const outputs = results[nodeId]
    if (!outputs) continue

    const outputValues = Object.values(outputs)
    const stillPending = outputValues.some(val => typeof val?.invokeIfAvailable === 'function' && val.elapsed === -1)

    if (stillPending) {
      nodeStatus.set(nodeId, 'skipped')

      const cache = stepCache.get(nodeId)
      console.warn(`⚠️ 节点 ${nodeId} 已执行但未完成，判定为 Skipped`)

      options?.onStep?.({
        index: cache?.index ?? 0,
        total: cache?.total ?? 0,
        nodeId,
        type: cache?.type ?? 'unknown',
        elapsed: -2,
        elapsedStr: 'Skipped',
        output: '',
        outputPreview: '',
      })
    }
  }

  const lastId = [...executed].at(-1)!
  const lastNode = json.nodes[lastId]
  // console.log('results', results)
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


function hasInvoke(v: unknown): v is { invokeIfAvailable: Function } {
  return typeof (v as any)?.invokeIfAvailable === 'function'
}

// function findPortNodeIdById(json: LangFlowJson, parentNodeId: string, portId: string): string | undefined {
//   return Object.values(json.nodes).find(
//     n => n.data?.parentNode === parentNodeId && n.id === portId
//   )?.id
// }

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

function isStartNode(json: LangFlowJson, nodeId: string, runType: string): boolean {
  const node = json.nodes[nodeId]
  if (runType === 'api') {
    return ['APIInput'].includes(node?.data?.type)
  }
  if (runType === 'chat') {
    return ['ChatInput'].includes(node?.data?.type)
  }
  return false
}

/* ---------------------------------------------------
   格式化耗时：<1 ms 保留 2 位小数；
   1 ms–999 ms 取整；1 s+ 转 s + ms；60 s+ 转 m + s。
 --------------------------------------------------- */
function formatElapsed(ms: number): string {
  if (ms < 0) return 'Pending'           // -1
  if (ms === -2) return 'Skipped'         // -2 （如果你用 -2 表示 Skipped）

  /* 🔽 关键：小于 0.1 ms 一律写 0.1 ms */
  if (ms < 0.1) return '0.1 ms'

  if (ms < 1) return `${ms.toFixed(2)} ms`   // 0.10 – 0.99
  if (ms < 10) return `${ms.toFixed(1)} ms`   // 1.0 – 9.9
  if (ms < 1000) return `${Math.round(ms)} ms`  // 10 – 999
  const s = Math.floor(ms / 1000)
  const rem = Math.round(ms % 1000)
  if (s < 60) return `${s} s ${rem} ms`
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m} m ${sec}s`
}

