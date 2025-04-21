import type { InputPortVariable, LangFlowJson } from '~/types/workflow'
import { load } from "@langchain/core/load"
// import {
//   AIMessage,
//   HumanMessage,
//   SystemMessage,
//   BaseMessage,
// } from '@langchain/core/messages'
import { StringPromptValue } from '@langchain/core/prompt_values'
/** RunnableLike: 带有 invoke 方法的 LangChain 对象 */
// interface RunnableLike {
//   invoke: (input: any) => Promise<any> | any
// }
// function isRunnable(obj: any): obj is RunnableLike {
//   return obj && typeof obj.invoke === 'function'
// }

function getParentNodeId(json: LangFlowJson, portNodeId: string): string | undefined {
  const portNode = json.nodes[portNodeId]
  return portNode?.data?.parentNode
}

// 安全地判断一个对象是否是 Runnable
function safeIsRunnable(obj: any): boolean {
  return obj && typeof obj.invoke === 'function'
}


async function resolveRunnableValue(val: any): Promise<any> {
  let result = val

  while (result && typeof result.invoke === 'function') {
    result = await result.invoke({})
  }

  return result
}
 
// 改进后的 resolveInputVariables
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
// export function extractMessage(output: unknown): any {
//   if (!output) return ''

//   // ✅ 字符串，直接返回
//   if (typeof output === 'string') {
//     return output
//   }

//   // ✅ LangChain Message 类型（AIMessage, HumanMessage, etc.）
//   if (
//     output &&
//     typeof output === 'object' &&
//     'content' in output &&
//     typeof (output as any).content === 'string'
//   ) {
//     return (output as any).content
//   }

//   // ✅ PromptValue 类型（如 StringPromptValue）
//   if (
//     output &&
//     typeof output === 'object' &&
//     typeof (output as any).toString === 'function'
//   ) {
//     try {
//       return output.toString()
//     } catch {
//       // fallback to raw object
//     }
//   }

//   return output
// }


// export function extractMessage(output: unknown): any {
//   if (!output) {
//     return ''
//   }

//   // ✅ 如果是字符串，直接返回
//   if (typeof output === 'string') {
//     return output
//   }

//   // ✅ LangChain Message 类型
//   if ((output as any)?.constructor?.name === 'HumanMessage' && typeof (output as any).content === 'string') {
//     return (output as any).content
//   }

//   if ((output as any)?.constructor?.name === 'AIMessage' && typeof (output as any).content === 'string') {
//     return (output as any).content
//   }

//   // ✅ PromptValue 类型
//   if ((output as any)?.constructor?.name === 'StringPromptValue' && typeof (output as any).value === 'string') {
//     return (output as any).value
//   }
//   return output
//   // ✅ 可调用对象，不执行，仅标注
//   // if (safeIsRunnable(output)) {
//   //   return  output
//   // }
  
// }




export async function normalizeOutput(output: any): Promise<string | any> {
  if (!output) return ''

  // 1. string
  if (typeof output === 'string') return output

  // 2. Runnable → invoke
  if (output?.invoke) {
    try {
      const result = await output.invoke({})
      return normalizeOutput(result)
    } catch (e) {
      return '[Error invoking runnable]'
    }
  }

  // 3. LangChain serialized
  if (
    output &&
    typeof output === 'object' &&
    'lc' in output &&
    'type' in output &&
    'id' in output
  ) {
    try {
      const obj = await load(output)
      return normalizeOutput(obj)
    } catch (e) {
      return '[Error loading LC object]'
    }
  }

  // 4. Message 类型
  if ('content' in output && typeof output.content === 'string') {
    return output.content
  }

  // 5. PromptValue 类型
  if (typeof output.toString === 'function') {
    return output.toString()
  }

  // fallback
  return output
}
