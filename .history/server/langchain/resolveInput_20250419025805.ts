import type { InputPortVariable } from '~/types/workflow'
// import { load } from '@langchain/core/load';
 
// import { StringPromptValue } from '@langchain/core/prompt_values'
 

  
 
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
        if(variable.allowedTypes?.includes('Message') || variable.allowedTypes?.includes('Prompt Message')){
          resolved = normalizeToString(potentialValue)
        }else{
          resolved = potentialValue
        }
       
        
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
 

 
export function normalizeToString(value: any): string {
  if (value?.content && typeof value.content === 'string') return value.content
  if (typeof value === 'string') return value
  // return JSON.stringify(value)
  return value
}
  