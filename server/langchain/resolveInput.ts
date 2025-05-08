import type { InputPortVariable } from '~/types/workflow'
import type { BuildContext } from '~/types/workflow'
// import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
export interface WrappedRunnable<T = any> {
  /** 只有在真正需要时才调用；内部会记录耗时并上报 */
  invokeIfAvailable: (input?: any) => Promise<T>
  /** -1 = 未执行, 0 = <1 ms, >0 = 实际 ms */
  readonly elapsed: number
}
export function wrapRunnable<T>(
  runnable: { invoke: (input?: any) => Promise<T> },
  nodeId: string,
  onElapsed?: (nodeId: string, ms: number) => void,
  options?: {
    context?: Record<string, any>
    portId?: string
    logFormat?: (result: T) => any  // 👈 新增：可选格式化函数
  }

) {
  let elapsed = -1
  let originalResult: any = undefined
  async function invokeIfAvailable(input?: any) {
    const t0 = performance.now()
    originalResult = await runnable.invoke(input ?? {})

    elapsed = performance.now() - t0
    onElapsed?.(nodeId, elapsed)

    // ✅ 日志写入：嵌套结构 logs[nodeId][portId]
    if (options?.context && options.portId) {
      const logs = options.context.logs ??= {}
      logs[nodeId] ??= {}
      const formatted = options.logFormat
        ? options.logFormat(simplifyContextObject(originalResult))
        : simplifyContextObject(originalResult)
      logs[nodeId][options.portId] = simplifyContextObject(formatted)
    }

    return originalResult
  }

  return {
    original: runnable,  // 👈 加一行，存原始
    invokeIfAvailable,
    get elapsed() { return elapsed },
    get originalResult() { return originalResult },  // 👈 新增
  }
}


function isForceStringifyMessageType(variable: InputPortVariable): boolean {
  return (
    variable.forceStringify &&
    (variable.allowedTypes?.includes('Message') || variable.allowedTypes?.includes('Prompt Message'))
  ) || false
}

async function resolveStringified(value: any): Promise<string> {
  if (typeof value?.invokeIfAvailable === 'function') {
    const result = await value.invokeIfAvailable()
    return normalizeToString(result ?? value)
  }
  return normalizeToString(value)
}
async function resolveStringifiedArray(values: any[]): Promise<string> {
  const parts: string[] = []
  for (const v of values) {
    parts.push(await resolveStringified(v))
  }
  return parts.join('\n')
}
export async function resolveInputVariables(
  context: Record<string, any>,
  variables: InputPortVariable[],
): Promise<Record<string, any>> {
  const inputValues: Record<string, any> = {}

  for (const variable of variables) {
    const potentialValue = context.resolvedInput[variable.id]
    const useDefault = variable.value ?? variable.defaultValue ?? ''
    let resolved: any = ''

    if (variable.connected) {
      if (Array.isArray(potentialValue)) {
        const filtered = potentialValue.filter(v => v !== undefined)
        if (filtered.length > 0) {
          resolved = isForceStringifyMessageType(variable)
            ? await resolveStringifiedArray(filtered)
            : (filtered.length === 1 ? filtered[0] : filtered)
        } else {
          resolved = useDefault
        }
      } else if (potentialValue !== undefined) {
        resolved = isForceStringifyMessageType(variable)
          ? await resolveStringified(potentialValue)
          : potentialValue
      } else {
        resolved = useDefault
      }
    } else {
      resolved = useDefault
    }

    inputValues[variable.name] = resolved

    // context.logs[variable.id] = resolved
    //这里是每个大 node 的所有 input 的值

    // context.logs[variable.id] = simplifyContextObject(resolved)
  }


  return inputValues
}


export function normalizeToString(value: any): string {

  if (value?.content && typeof value.content === 'string') return value.content
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}


function simplifyContextObject(obj: any, visited = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') return obj

  if (visited.has(obj)) return '[Circular]'
  visited.add(obj)

  // 1. 如果是 langchain 的东西，直接输出末尾 id
  if (Array.isArray(obj.lc_namespace) && obj.lc_namespace.length > 0) {
    return obj.lc_namespace.at(-1) || 'UnknownLangchainObject'
  }

  // 2. 如果是数组，递归简化每个元素
  if (Array.isArray(obj)) {
    return obj.map(item => simplifyContextObject(item, visited))
  }

  // 3. 如果是正常对象
  const simpleObj: Record<string, any> = {}
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]

    // 特例：如果 value 也是 langchain 对象，提取它，不要展开
    if (value && typeof value === 'object' && Array.isArray(value.lc_namespace)) {
      simpleObj[key] = value.lc_namespace.at(-1) || 'UnknownLangchainObject'
    } else {
      simpleObj[key] = simplifyContextObject(value, visited)
    }
  }

  return simpleObj
}


// 用于非 runnable 场景手动写日志
export function writeLog(context: BuildContext, nodeId: string, portId: string, content: any) {
  context.logs[nodeId] ??= {}
  context.logs[nodeId][portId] = simplifyContextObject(content)
}

