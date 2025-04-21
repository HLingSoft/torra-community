import type { InputPortVariable, LangFlowJson } from '~/types/workflow'
import { load } from '@langchain/core/load';
 
import { StringPromptValue } from '@langchain/core/prompt_values'
 

 function isLangChainMessageLike(obj: any): boolean {
  // ✅ 1. 真正的 JS Message 实例（含 content 字段且有 __messageType）
  if (
    obj &&
    typeof obj === 'object' &&
    typeof obj.content === 'string' &&
    '__messageType' in obj
  ) {
    return true
  }

  // ✅ 2. LangChain Python 风格序列化对象
  if (
    obj &&
    typeof obj === 'object' &&
    obj?.lc === 1 &&
    obj?.type === 'constructor' &&
    Array.isArray(obj.id) &&
    obj.id[0] === 'langchain_core' &&
    obj.id[1] === 'messages' &&
    typeof obj.kwargs?.a === 'string'
  ) {
    return true
  }

  return false
}

 function extractMessageContent(value: any): string | undefined {
  console.log('extractMessageContent', isLangChainMessageLike(value))
  if (!isLangChainMessageLike(value)) return undefined

  // ✅ 如果是 JS Message 实例（真实对象）
  if ('__messageType' in value) {
    return value.content
  }

  // ✅ 如果是 Python 风格的序列化 JSON
  if (
    value?.lc === 1 &&
    Array.isArray(value.id) &&
    value.id[1] === 'messages'
  ) {
    const type = value.id[2] ?? 'Message'
    const content = value.kwargs?.a ?? '[Missing content]'
    return `[${type.replace('Message', '')}] ${content}`
  }

  return undefined
}
 
export async function resolveInputVariables(
  context: Record<string, any>,
  variables: InputPortVariable[],
): Promise<Record<string, any>> {
  const inputValues: Record<string, string> = {}

  for (const variable of variables) {
 
    let resolved: any = ''

 

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
      
    }

    
    inputValues[variable.name] = resolved
    // console.log('resolveInputVariables:', variable.name, resolved)
    
  }

  return inputValues
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
  console.log('langchain message 1:', value)
  if(isLangChainMessageLike(value)){
    const content = extractMessageContent(value)
    if (content) {
      return content
    }
  }
  // ✅ LangChain Message 类型
  // if (value && typeof value === 'object' && 'content' in value) {
    
  //   return extractMessageContent(value)
  // }

  return value
}
