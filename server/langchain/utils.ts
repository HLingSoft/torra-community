import type { InputPortVariable, OutputPortVariable, BuildContext, LangFlowJson, DAGStepInfo, PortLog } from '~/types/workflow'

import { useJSONStringify } from '~/composables'


export interface WrappedRunnable<T = any> {
  invokeIfAvailable: (input?: any) => Promise<T | undefined>

  readonly original: { invoke: (input?: any) => Promise<T> }
}

export function isWrappedRunnable(obj: any): obj is WrappedRunnable {
  return !!obj && typeof obj.invokeIfAvailable === 'function'
}

export function wrapRunnable<T>(
  runnable: { invoke: (input?: any) => Promise<T> },
  nodeId: string,

  options: {
    context: BuildContext
    portId: string
    logFormat: (res: any) => any
    outputPort: OutputPortVariable
  }
): WrappedRunnable<T> {

  let originalResult: T | undefined

  async function invokeIfAvailable(input?: any): Promise<T> {


    const t0 = performance.now()
    let error: string | undefined

    try {
      originalResult = await runnable.invoke(input ?? {})
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      originalResult = { error } as any
    }

    const elapsed = performance.now() - t0

    const preNodeLogs = options?.context?.logs?.[nodeId] ?? {}

    const preElapsed = preNodeLogs.elapsed ?? 0

    preNodeLogs.elapsed += preElapsed


    //还需要覆盖 那个 portId 对应的content 和elapsed
    const result = options.logFormat(useJSONStringify(originalResult).slice(0, 200) + '...')
    updatePortLog(
      options.context,
      nodeId,
      options.portId,
      {
        content: result,
        elapsed: elapsed,
        timestamp: Date.now(),
      }
    )



    return originalResult as T
  }

  return {
    original: runnable,
    invokeIfAvailable,

  }
}


async function resolveDeep(value: any): Promise<any> {
  if (Array.isArray(value)) return Promise.all(value.map(resolveDeep))
  if (isWrappedRunnable(value)) return await value.invokeIfAvailable()
  return value
}

export async function resolveInputVariables(
  context: BuildContext,
  variables: InputPortVariable[]
): Promise<Record<string, any>> {
  const vals: Record<string, any> = {}

  for (const v of variables) {
    if (!v || !v.id) continue

    try {
      const remote = context.resolvedInput[v.id]
      const fallback = v.value ?? v.defaultValue ?? ''
      let resolved: any = fallback

      if (v.connected && remote !== undefined) {
        resolved = await resolveDeep(remote)
      }

      vals[v.id] = resolved
    } catch (err) {
      vals[v && v.id ? v.id : `unknown_${Math.random()}`] = `[Error: ${err instanceof Error ? err.message : String(err)}]`
    }
  }

  return vals
}

export function collectLoopBodyNodes(
  json: LangFlowJson,
  loopId: string,
  itemPortId: string,
  itemResultPortId: string
): Set<string> {
  const endNodes = json.edges
    .filter(e => e.source === loopId && e.sourceHandle === itemResultPortId)
    .map(e => e.target)

  const body = new Set<string>()
  const stack = json.edges
    .filter(e => e.source === loopId && e.sourceHandle === itemPortId)
    .map(e => e.target)

  while (stack.length) {
    const nid = stack.pop()!
    if (nid === loopId || body.has(nid)) continue
    body.add(nid)
    if (endNodes.includes(nid)) continue
    json.edges.filter(e => e.source === nid).forEach(e => stack.push(e.target))
  }

  endNodes.forEach(n => body.add(n))
  return body
}
export function contextLogsToSteps(
  context: BuildContext,
  total: number
): DAGStepInfo[] {
  const steps: DAGStepInfo[] = []

  Object.entries(context.logs).forEach(([nodeId, nodeLog], idx) => {
    const { title, type } = nodeLog

    // ✅ 只处理真正的端口字段
    const ports = Object.entries(nodeLog)
      .filter(([k, v]) => typeof v === 'object' && v && 'outputType' in v && 'id' in v)
      .map(([portId, val]) => {
        return {
          portId,
          elapsed: val.elapsed ?? 0,
          elapsedStr: val.elapsed != null
            ? (val.elapsed < 1000 ? `${val.elapsed.toFixed(1)}ms` : `${(val.elapsed / 1000).toFixed(2)}s`)
            : '-',
          content: useJSONStringify(val.content),
          timestamp: val.timestamp ?? Date.now(),
          name: val.name ?? portId,
          outputType: val.outputType ?? 'unknown',
          id: val.id ?? portId

        }
      })

    steps.push({
      index: idx + 1,
      total,
      nodeId,
      nodeTitle: title,
      nodeType: type,
      ports,
      elapsed: nodeLog.elapsed ?? -1, // 若缺省则给 -1
      error: nodeLog.error, // 错误信息

    })

  })

  return steps
}


export function writeLogs(
  context: BuildContext,
  nodeId: string,
  title: string,
  type: string,
  logsPerPort: Record<string, PortLog>,
  elapsed?: number
) {
  const logs = (context.logs ??= {})
  const nodeLogs = (logs[nodeId] ??= {})
  nodeLogs.title = title
  nodeLogs.type = type
  nodeLogs.elapsed =
    typeof elapsed === 'number'
      ? (typeof nodeLogs.elapsed === 'number' && nodeLogs.elapsed > 0
        ? nodeLogs.elapsed + elapsed
        : elapsed)
      : nodeLogs.elapsed ?? -1


  for (const portId in logsPerPort) {
    const { content, outputPort, elapsed } = logsPerPort[portId]
    nodeLogs[portId] = {
      content,
      name: outputPort.name,
      outputType: outputPort.outputType,
      id: outputPort.id,
      timestamp: Date.now(),
      ...(elapsed != null ? { elapsed } : {})

    }
  }

}


export function updatePortLog(
  context: BuildContext,
  nodeId: string,
  portId: string,
  data: Partial<Pick<PortLog, 'content' | 'elapsed' | 'timestamp'>>,

) {
  const logs = (context.logs ??= {})
  const nodeLogs = (logs[nodeId] ??= {})

  const existing = nodeLogs[portId] ?? {}

  nodeLogs[portId] = {
    ...existing,
    ...data,
  }
}
