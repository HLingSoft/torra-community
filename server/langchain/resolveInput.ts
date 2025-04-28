import type { InputPortVariable } from '~/types/workflow'
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
) {
  let elapsed = -1

  async function invokeIfAvailable(input?: any) {
    const t0 = performance.now()
    const out = await runnable.invoke(input ?? {})

    elapsed = performance.now() - t0
    onElapsed?.(nodeId, elapsed)
    return out
  }

  return {
    original: runnable,  // 👈 加一行，存原始
    invokeIfAvailable,
    get elapsed() { return elapsed },
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

  }
  // console.log('inputValues', inputValues)
  return inputValues
}


export function normalizeToString(value: any): string {

  if (value?.content && typeof value.content === 'string') return value.content
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}
