import type { InputPortVariable, OutputPortVariable, BuildContext, LangFlowJson, DAGStepInfo, PortLog } from '~/types/workflow'
import type { SafeRunCollectorHandler } from './safeRunCollectorHandler'
import { extractRunStats } from './extractRunStats'


function isPojo(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && value.constructor === Object;
}

export function toJsonSafe<T>(input: T, seen = new WeakMap()): any {
  if (input === null || typeof input === 'number' || typeof input === 'boolean' || typeof input === 'string') return input
  if (input instanceof Date) return input.toISOString()
  if (typeof input === 'object') {
    if (seen.has(input as any)) return '[Circular]'
    seen.set(input as any, true)
  }
  if (Array.isArray(input)) return input.map(item => toJsonSafe(item, seen))
  if (isPojo(input)) {
    const cleaned: Record<string, any> = {}
    for (const [k, v] of Object.entries(input)) cleaned[k] = toJsonSafe(v, seen)
    return cleaned
  }
  return `[${(input as any)?.constructor?.name ?? 'Object'}]`
}

export interface WrappedRunnable<T = any> {
  invokeIfAvailable: (input?: any) => Promise<T | undefined>
  readonly elapsed: number
  readonly originalResult: T | undefined
  readonly original: { invoke: (input?: any) => Promise<T> }
}

export function isWrappedRunnable(obj: any): obj is WrappedRunnable {
  return !!obj && typeof obj.invokeIfAvailable === 'function'
}

export function wrapRunnable<T>(
  runnable: { invoke: (input?: any) => Promise<T> },
  nodeId: string,
  title: string,
  type: string,
  onElapsed?: (id: string, ms: number) => void,
  options?: {
    context?: BuildContext
    portId?: string
    logFormat?: (res: any) => any
    collector?: SafeRunCollectorHandler
    outputPort: OutputPortVariable
  }
): WrappedRunnable<T> {
  let elapsed = -1
  let originalResult: T | undefined

  // ✅ 初始化日志：先写入 pending 状态
  if (options?.context && options.portId) {
    writeLogs(options.context, nodeId, title, type, {
      [options.portId]: {
        content: '[Pending Execution]',
        outputPort: options.outputPort,
        elapsed: undefined,
      }
    })
  }

  async function invokeIfAvailable(input?: any): Promise<T> {
    const t0 = performance.now()
    let error: string | undefined

    try {
      originalResult = await runnable.invoke(input ?? {})
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      originalResult = { error } as any
    }

    elapsed = performance.now() - t0
    onElapsed?.(nodeId, elapsed)

    if (options?.context && options.portId) {
      const result = options.logFormat ? options.logFormat(JSON.stringify(originalResult, null, 2)) : originalResult
      // const runStats = options.collector ? extractRunStats(options.collector.runs) : undefined

      // const logContent = {
      //   ...result,
      //   ...(runStats ? { runStats } : {}),
      //   ...(error ? { error } : {})
      // }


      // ✅ 覆盖之前的日志（现在有结果和 token 消耗）
      writeLogs(options.context, nodeId, title, type, {
        [options.portId]: {
          content: result,
          outputPort: options.outputPort,
          elapsed,
        }
      }, elapsed)
    }

    return originalResult as T
  }

  return {
    original: runnable,
    invokeIfAvailable,
    get elapsed() {
      return elapsed
    },
    get originalResult() {
      return originalResult
    }
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
  // console.log('context.logs', context.logs)

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
          content: toJsonSafe(val.content),
          timestamp: val.timestamp ?? Date.now(),
          name: val.name ?? portId,
          outputType: val.outputType ?? 'unknown',
          id: val.id ?? portId

        }
      })
    /* ---------- 2. 把 node 自身耗时 + 所有 port 耗时 ---------- */
    const ownElapsed = nodeLog.elapsed ?? 0
    const portsElapsed = ports.reduce((sum, p) => sum + (p.elapsed ?? 0), 0)
    const totalElapsed = ownElapsed + portsElapsed || -1   // 若都缺，仍给 -1
    steps.push({
      index: idx + 1,
      total,
      nodeId,
      nodeTitle: title,
      nodeType: type,
      ports,
      elapsed: totalElapsed

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
  nodeLogs.elapsed = elapsed ?? -1 // 默认值为 -1，表示未设置

  for (const portId in logsPerPort) {
    const { content, outputPort, elapsed } = logsPerPort[portId]
    nodeLogs[portId] = {
      content,
      timestamp: Date.now(),
      name: outputPort.name,
      outputType: outputPort.outputType,
      id: outputPort.id,
      ...(elapsed != null ? { elapsed } : {})
    }
  }
  // console.log('writeLogs', nodeId, nodeLogs)
}
