import type { FlowNode, LangFlowJson, NodeResultsMap, BuildContext } from '~/types/workflow'
import type { DAGStepInfo } from '~/types/ws'
import { initFactories, nodeFactoryMap } from './factories'
import { ChatInputData } from '~/types/node-data/chat-input'
import * as _ from 'lodash-es'

initFactories()

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
  runType = 'chat', // 'chat' or 'api'
  options?: ExecuteDAGOptions,
) {
  // --- Context & state ---------------------------------------------------
  const nodeElapsedMap = new Map<string, number>()
  const context: BuildContext = {
    logs: {},
    results: {},
    json,
    resolvedInput: {},
    onRunnableElapsed,
  }
  const nodeStatus = new Map<string, 'pending' | 'completed' | 'skipped'>()
  const stepCache = new Map<string, { index: number; total: number; type: string }>()
  const skipSet = new Set<string>()

  function onRunnableElapsed(nodeId: string, ms: number) {
    nodeStatus.set(nodeId, 'completed')
    const cache = stepCache.get(nodeId)
    if (options?.onStep) {
      const step: DAGStepInfo = {
        index: cache?.index ?? 0,
        total: cache?.total ?? 0,
        nodeId,
        type: cache?.type ?? 'unknown',
        elapsed: ms,
        elapsedStr: formatElapsed(ms),
        output: context.results[nodeId],
        outputPreview: '',
      }
      options.onStep(step)
      nodeElapsedMap.set(nodeId, ms)
    }
  }

  // --- Initial topology -------------------------------------------------
  const customNodeIds = Object.entries(json.nodes)
    .filter(([_, node]) => node.type === 'custom')
    .map(([id]) => id)

  const initialInputConns = buildInputConnections(json)
  const initialSorted = topoSortSafe(json.nodes, initialInputConns, customNodeIds)

  const executed = new Set<string>()

  // --- Helper: check if all inputs ready under current skipSet ------------
  function areInputsReady(nodeId: string): boolean {
    const ins = buildInputConnections(json, skipSet)
    const conns = ins[nodeId] || {}
    return Object.values(conns).every(arr =>
      arr.length === 0 ||
      arr.some(c => executed.has(c.fromNodeId))
    )
  }

  // --- Main execution loop ----------------------------------------------
  while (true) {
    const nextId = initialSorted.find(id =>
      !executed.has(id) &&
      !skipSet.has(id) &&
      areInputsReady(id)
    )
    if (!nextId) break

    const node = json.nodes[nextId]
    console.log(`🔗 Executing ${nextId} (${node.data.type})`)

    // --- Bind input message for start node -------------------------------
    if (isStartNode(json, nextId, runType)) {
      if (node.data.type === 'ChatInput') {
        const data = node.data as ChatInputData
        if (data.dynamicValue) data.inputValue = inputMessage
      } else {
        node.data.inputValue = inputMessage
      }
    }

    // --- Resolve upstream port inputs ------------------------------------
    const resolvedInput: Record<string, any> = {}
    const ins = buildInputConnections(json, skipSet)[nextId] || {}
    for (const [portId, conns] of Object.entries(ins)) {
      const arr = Array.isArray(conns) ? conns : [conns]
      const vals = arr
        .map(c => context.results[c.fromNodeId]?.[c.fromPortId])
        .filter(v => v !== undefined)
      resolvedInput[portId] = vals.length === 1 ? vals[0] : vals
    }

    // --- Factory invocation ----------------------------------------------
    const factory = nodeFactoryMap[node.data.type]
    if (!factory) throw new Error(`Factory not found for ${node.data.type}`)
    const t0 = performance.now()
    const output = await factory(node, { ...context, resolvedInput })
    const buildMs = performance.now() - t0

    context.results[nextId] = output
    executed.add(nextId)

    const hasRunnable = Object.values(output).some(hasInvoke)
    nodeStatus.set(nextId, hasRunnable ? 'pending' : 'completed')

    if (options?.onStep) {
      const step: DAGStepInfo = {
        index: executed.size,
        total: initialSorted.length,
        nodeId: nextId,
        type: node.data.type,
        elapsed: hasRunnable ? -1 : buildMs,
        elapsedStr: hasRunnable ? 'Pending' : formatElapsed(buildMs),
        output,
        outputPreview: '',
      }
      options.onStep(step)
      nodeElapsedMap.set(nextId, step.elapsed)
    }
    stepCache.set(nextId, {
      index: executed.size,
      total: initialSorted.length,
      type: node.data.type,
    })

    // --- IfElse: update skipSet -------------------------------------------
    if (node.data.type === 'IfElse') {
      const isTrue = output.default === true
      const skipPort = isTrue ? node.data.falseOutputVariable.id : node.data.trueOutputVariable.id
      const activePort = isTrue ? node.data.trueOutputVariable.id : node.data.falseOutputVariable.id

      // 用完整图去收集
      const fullOutConns = buildOutputConnections(json)

      // 1) 假分支所有下游
      const skipDown = new Set<string>()
      for (const conn of fullOutConns[nextId]?.[skipPort] || []) {
        collectDownstream(conn.toNodeId, fullOutConns).forEach(id => skipDown.add(id))
      }

      // 2) 真分支所有下游
      const activeDown = new Set<string>()
      for (const conn of fullOutConns[nextId]?.[activePort] || []) {
        collectDownstream(conn.toNodeId, fullOutConns).forEach(id => activeDown.add(id))
      }

      // 3) 只跳过纯假分支里的节点（剔除共有的那部分）
      for (const id of skipDown) {
        if (!activeDown.has(id)) {
          skipSet.add(id)
        }
      }
    }

  }

  // --- Finalize statuses for any remaining pendings ---------------------
  for (const id of initialSorted) {
    if (!executed.has(id) && !skipSet.has(id)) continue
    if (!executed.has(id)) {
      nodeStatus.set(id, 'skipped')
    }
  }

  // --- Extract final output ---------------------------------------------
  const lastId = [...executed].pop()!
  const lastNode = json.nodes[lastId]
  const lastRes = context.results[lastId] || {}
  const output =
    lastRes.default ??
    lastRes[lastNode.data.outputVariable?.id] ??
    Object.values(lastRes)[0] ??
    'No output'

  const logs = extractNodesFromLogsByConnections(context, json, executed, nodeElapsedMap)
  return { results: context.results, logs, output }
}


// --- Helpers ------------------------------------------------------------

function hasInvoke(v: unknown): v is { invokeIfAvailable: Function } {
  return typeof (v as any)?.invokeIfAvailable === 'function'
}

function buildInputConnections(
  json: LangFlowJson,
  skipSet: Set<string> = new Set(),
) {
  const conns: Record<string, Record<string, { fromNodeId: string; fromPortId: string }[]>> = {}
  for (const edge of json.edges) {
    const from = edge.data.sourceParent, to = edge.data.targetParent
    if (!from || !to) continue
    if (skipSet.has(from) || skipSet.has(to)) continue
    conns[to] ||= {}
    conns[to][edge.target] ||= []
    conns[to][edge.target].push({ fromNodeId: from, fromPortId: edge.source })
  }
  return conns
}

function buildOutputConnections(
  json: LangFlowJson,
  skipSet: Set<string> = new Set(),
) {
  const out: Record<string, Record<string, OutputConnection[]>> = {}
  for (const edge of json.edges) {
    const from = edge.data.sourceParent, to = edge.data.targetParent
    if (!from || !to) continue
    if (skipSet.has(from) || skipSet.has(to)) continue
    out[from] ||= {}
    out[from][edge.source] ||= []
    out[from][edge.source].push({ fromPortId: edge.source, toNodeId: to, toPortId: edge.target })
  }
  return out
}

function collectDownstream(
  startId: string,
  outputConnections: ReturnType<typeof buildOutputConnections>,
) {
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length) {
    const cur = stack.pop()!
    if (visited.has(cur)) continue
    visited.add(cur)
    const outs = outputConnections[cur] || {}
    for (const arr of Object.values(outs)) {
      arr.forEach(c => stack.push(c.toNodeId))
    }
  }
  return visited
}

function topoSortSafe(
  nodes: Record<string, FlowNode>,
  inputConns: ReturnType<typeof buildInputConnections>,
  customNodeIds: string[],
): string[] {
  const adj: Record<string, string[]> = {}
  const indegree: Record<string, number> = {}
  customNodeIds.forEach(id => { adj[id] = []; indegree[id] = 0 })
  for (const [tgt, ports] of Object.entries(inputConns)) {
    if (!customNodeIds.includes(tgt)) continue
    Object.values(ports).flat().forEach(({ fromNodeId }) => {
      if (!customNodeIds.includes(fromNodeId)) return
      adj[fromNodeId].push(tgt)
      indegree[tgt]++
    })
  }
  const q = customNodeIds.filter(id => indegree[id] === 0)
  const res: string[] = []
  while (q.length) {
    const cur = q.shift()!
    res.push(cur)
    adj[cur].forEach(nxt => {
      indegree[nxt]--
      if (indegree[nxt] === 0) q.push(nxt)
    })
  }
  return res
}

function isStartNode(json: LangFlowJson, nodeId: string, runType: string): boolean {
  const t = json.nodes[nodeId]?.data?.type
  if (runType === 'api') return t === 'APIInput'
  if (runType === 'chat') return t === 'ChatInput'
  return false
}

function formatElapsed(ms: number): string {
  if (ms < 0) return ms === -2 ? 'Skipped' : 'Pending'
  if (ms < 0.1) return '0.1 ms'
  if (ms < 1) return `${ms.toFixed(2)} ms`
  if (ms < 10) return `${ms.toFixed(1)} ms`
  if (ms < 1000) return `${Math.round(ms)} ms`
  const s = Math.floor(ms / 1000), rem = Math.round(ms % 1000)
  if (s < 60) return `${s} s ${rem} ms`
  const m = Math.floor(s / 60), sec = s % 60
  return `${m} m ${sec}s`
}

function extractNodesFromLogsByConnections(
  context: BuildContext,
  json: LangFlowJson,
  executed: Set<string>,
  nodeElapsedMap: Map<string, number>
) {
  const inConns = buildInputConnections(json)
  const outConns = buildOutputConnections(json)
  const structured: Array<any> = []

  for (const nodeId of executed) {
    const node = json.nodes[nodeId]
    if (!node || node.type !== 'custom') continue
    const name = node.data.title || node.data.name || 'Unnamed'
    const inputs: Record<string, any> = {}
    const connMap = inConns[nodeId] || {}
    for (const [port, arr] of Object.entries(connMap)) {
      const vals = arr
        .map(c => context.logs[c.fromNodeId]?.[c.fromPortId])
        .filter(v => v !== undefined)
      inputs[port] = vals.length === 1 ? vals[0] : vals
    }
    const outputs: Record<string, any> = {}
    const logs = context.logs[nodeId] || {}
    for (const port of Object.keys(outConns[nodeId] || {})) {
      if (logs.hasOwnProperty(port)) outputs[port] = logs[port]
    }
    let elapsed = nodeElapsedMap.get(nodeId) ?? -2
    if (elapsed > 0 && elapsed < 0.1) elapsed = 0.1
    if (elapsed > 0) elapsed = Math.round(elapsed * 100) / 100

    structured.push({ nodeId, name, inputs, outputs, elapsed })
  }

  return structured
}
