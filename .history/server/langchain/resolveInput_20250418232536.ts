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
  // ✅ LangChain Message 类型
  // if (value && typeof value === 'object' && 'content' in value) {
    
  //   return extractMessageContent(value)
  // }

  return value
}
