import type { InputPortVariable, BuildContext, LangFlowJson } from '~/types/workflow'

/**
 * 判断是否为“纯粹的普通对象”（Plain Old JS Object）
 */
function isPojo(value: unknown): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.constructor === Object
  );
}

/**
 * 将任意值转换为 **100% 可 JSON.stringify** 的结构。
 * - Date          ➜ ISO 字符串
 * - 函数 / Symbol ➜ 丢弃
 * - 数组 / 对象   ➜ 递归清洗
 * - 自定义实例    ➜ `[ClassName]`
 * - 循环引用      ➜ `[Circular]`
 */
export function toJsonSafe<T>(input: T, seen = new WeakMap()): any {
  // 基本值直接返回
  if (
    input === null ||
    typeof input === 'number' ||
    typeof input === 'boolean' ||
    typeof input === 'string'
  )
    return input;

  // 日期对象
  if (input instanceof Date) return input.toISOString();

  // 处理循环引用
  if (typeof input === 'object') {
    if (seen.has(input as any)) return '[Circular]';
    seen.set(input as any, true);
  }

  // 数组
  if (Array.isArray(input)) {
    return input.map(item => toJsonSafe(item, seen));
  }

  // 纯对象
  if (isPojo(input)) {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      cleaned[k] = toJsonSafe(v, seen);
    }
    return cleaned;
  }

  // 其它自定义实例
  return `[${(input as any)?.constructor?.name ?? 'Object'}]`;
}

export interface WrappedRunnable<T = any> {
  invokeIfAvailable: (input?: any) => Promise<T>
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
  onElapsed?: (nodeId: string, ms: number) => void,
  options?: {
    context?: BuildContext
    portId?: string
    logFormat?: (result: T) => any
  },
): WrappedRunnable<T> {
  let elapsed = -1
  let originalResult: any

  async function invokeIfAvailable(input?: any) {
    const t0 = performance.now()
    originalResult = await runnable.invoke(input ?? {})
    elapsed = performance.now() - t0
    onElapsed?.(nodeId, elapsed)

    // 如有日志写入
    if (options?.context && options.portId) {
      const logs = (options.context.logs ??= {})
      logs[nodeId] ??= {}
      const formatted = options.logFormat
        ? options.logFormat(originalResult)
        : originalResult
      logs[nodeId][options.portId] = formatted
    }

    return originalResult
  }

  return {
    original: runnable,
    invokeIfAvailable,
    get elapsed() { return elapsed },
    get originalResult() { return originalResult },
  }
}

// 简单日志（如需更详细结构可再扩展）
// export function writeLog(
//   context: BuildContext,
//   nodeId: string,
//   portId: string,
//   content: any,
// ) {
//   context.logs[nodeId] ??= {}
//   context.logs[nodeId][portId] = content
// }

export function writeLog(
  context: BuildContext,
  nodeId: string,
  portId: string,
  content: any,
  options?: {
    nodeTitle?: string
    type?: string
    elapsed?: number
    timestamp?: number
  }
) {
  const logs = (context.logs ??= {})
  const nodeLog = (logs[nodeId] ??= {})

  if (options?.nodeTitle && !nodeLog._title) {
    nodeLog._title = options.nodeTitle
  }

  nodeLog[portId] = {
    content,
    ...(options?.type && { type: options.type }),
    ...(options?.elapsed !== undefined && { elapsed: options.elapsed }),
    ...(options?.timestamp !== undefined && { timestamp: options.timestamp }),
  }
}
// 递归 resolve，支持多层数组嵌套
async function resolveDeep(value: any): Promise<any> {
  if (Array.isArray(value)) {
    // 递归处理每一项
    return Promise.all(value.map(resolveDeep))
  } else if (isWrappedRunnable(value)) {
    // 处理 runnable
    return await value.invokeIfAvailable()
  } else {
    // 普通值直接返回
    return value
  }
}
export async function resolveInputVariables(
  context: BuildContext,
  variables: InputPortVariable[],
): Promise<Record<string, any>> {
  const vals: Record<string, any> = {}

  for (const v of variables) {
    if (!v || !v.id) {
      // console.warn(`[resolveInputVariables] 警告: 变量未配置完整，变量为: ${JSON.stringify(v)}`);
      continue;
    }

    try {
      const remote = context.resolvedInput[v.id]
      const fallback = v.value ?? v.defaultValue ?? ''
      let resolved: any = fallback

      if (v.connected && remote !== undefined) {
        resolved = await resolveDeep(remote)
      }

      // writeLog(context, v.id, v.data.name, v.id, resolved)
      vals[v.id] = resolved
      // console.log(`[resolveInputVariables] 变量 ${v.id} 解析后:`, resolved);
    } catch (err) {
      // console.error(`[resolveInputVariables] 解析变量 ${v && v.id} 出错:`, err)
      vals[v && v.id ? v.id : `unknown_${Math.random()}`] = `[Error: ${err instanceof Error ? err.message : String(err)}]`
    }
  }

  return vals
}


export function collectLoopBodyNodes(
  json: LangFlowJson,
  loopId: string,
  itemPortId: string,        // ↱  loop.item
  itemResultPortId: string,  // ↳  loop.itemResult
) {

  // ① 终点节点 = itemResult 的 *直接* target（可能有多条线）
  const endNodes = json.edges
    .filter(e => e.source === loopId && e.sourceHandle === itemResultPortId)
    .map(e => e.target);


  const body = new Set<string>();
  const stack = json.edges
    .filter(e => e.source === loopId && e.sourceHandle === itemPortId)
    .map(e => e.target);

  while (stack.length) {
    const nid = stack.pop()!;
    if (nid === loopId || body.has(nid)) continue;

    body.add(nid);            // 记录本节点

    // 如果已经到 “终点节点” 就停止向后扩散
    if (endNodes.includes(nid)) continue;

    json.edges
      .filter(e => e.source === nid)
      .forEach(e => stack.push(e.target));
  }

  // 把“终点节点”本身也放进循环体（它在上一轮里已经加了，但若 itemResult 没连线则为空）
  endNodes.forEach(n => body.add(n));

  return body;
}
