import type { InputPortVariable, LangFlowJson } from '~/types/workflow'
import { load } from '@langchain/core/load';
 
import { StringPromptValue } from '@langchain/core/prompt_values'
 

 
 
export async function resolveInputVariables(
  context: Record<string, any>,
  variables: InputPortVariable[],
): Promise<Record<string, any>> {
  const inputValues: Record<string, string> = {}

  for (const variable of variables) {
 
    let resolved: any = ''

    // const portId = variable.id

    if (variable.connected) {
      const potentialValue= context.resolvedInput[variable.id]
     
     
      if(potentialValue){
        
        resolved =await normalizeOutput(potentialValue)
        
      }
     
    }
    else {
      resolved = (variable.value !== undefined && variable.value !== null && variable.value !== '')
        ? variable.value
        : (variable.defaultValue || '')
      // console.log(`🔸 变量 [${variable.name}] 未连接，使用默认值:`, resolved)
    }

    // inputValues[variable.name] = typeof resolved === 'string' ? resolved : JSON.stringify(resolved)
    inputValues[variable.name] = resolved
    // console.log(`✅ 变量 [${variable.name}] 最终值:`, inputValues[variable.name])
  }

  return inputValues
}
 

export function extractMessageContent(value: any): string | undefined {
  if (!value || typeof value !== 'object' || !('content' in value)) {
    return undefined
  }

  const type = value.constructor?.name ?? ''
  let content = value.content

  // 如果 content 是对象，尝试转成 JSON 字符串
  if (typeof content === 'object') {
    try {
      content = JSON.stringify(content, null, 2)
    } catch {
      content = '[Unsupported content format]'
    }
  }

  switch (type) {
    case 'HumanMessage':
      return `🧑 Human: ${content}`
    case 'AIMessage':
      return `🤖 AI: ${content}`
    case 'SystemMessage':
      return `⚙️ System: ${content}`
    case 'FunctionMessage':
      return `🛠️ Function [${value.name ?? 'unknown'}]: ${content}`
    case 'ChatMessage':
      return `[${value.role ?? 'unknown'}]: ${content}`
    default:
      return `[Unknown Message Type]: ${content}`
  }
}
 
export async function normalizeOutput(value: unknown): Promise<any> {
  if (!value) return ''

  // ✅ 直接字符串
  if (typeof value === 'string') return value

  // ✅ 可运行对象：直接用
  if (value && typeof (value as any).invoke === 'function') {
    return value
  }

  // ✅ LangChain Serialized 对象（你遇到的）
 
  if (value && typeof value === 'object' && 'lc_serializable' in value) {
    try {
      const serialized = JSON.stringify(value) // 👈 先转成 string
      const real = await load(serialized)      // ✅ 再传入
      return real
    } catch (e) {
      console.error('⚠️ 反序列化失败:', e)
      return value
    }
  }

  // ✅ LangChain Message 类型
  if (value && typeof value === 'object' && 'content' in value) {
    return extractMessageContent(value)
  }

  return value
}
