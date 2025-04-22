import type { InputPortVariable } from '~/types/workflow'
// import { load } from '@langchain/core/load';
 
// import { StringPromptValue } from '@langchain/core/prompt_values'
 
export function wrapRunnable(runnable: any) {
  return {
    original: runnable,
    invokeIfAvailable: async (input?: any) => {
      if (typeof runnable?.invoke === 'function') {
        return await runnable.invoke(input ?? {})
      } else {
        console.warn('invoke() 不可用');
        return null
      }
    }
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

  return inputValues
}


export function normalizeToString(value: any): string {

  if (value?.content && typeof value.content === 'string') return value.content
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}
