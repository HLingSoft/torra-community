import type { InputPortVariable, LangFlowJson } from '~/types/workflow'
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
): Promise<Record<string, string>> {
  const inputValues: Record<string, string> = {}

  for (const variable of variables) {
    // if(variable.name ==='history'){
    //     console.log('context',context.resolvedInput[variable.id])
    // }
    console.log(`🔑 解析变量 [${variable.name}]，连接状态:`, variable)
    let resolved: any = ''

    const portId = variable.id

    if (variable.connected) {
      if(context.resolvedInput[variable.id]){
        resolved = context.resolvedInput[variable.id]
        console.log(`🔑 变量 [${variable.name}] 已解析:`, resolved)
        inputValues[variable.name] = typeof resolved === 'string' ? resolved : JSON.stringify(resolved)
        continue
      }
      const edge = context.json.edges.find((e: any) => e.target === portId)
      if (!edge) {
        
        console.warn(`⚠️ 找不到连接 inputPort [${portId}] 的边`)
        inputValues[variable.name] = ''
        continue
      }

      const sourcePortId = edge.source
     
      const upstreamNodeId = getParentNodeId(context.json, sourcePortId)
      const allResults = context.results || {}
      const upstreamResult = upstreamNodeId ? allResults[upstreamNodeId] : undefined

      if (!upstreamResult) {
        console.warn(`⚠️ 无法解析上游节点或其结果: ${upstreamNodeId}`)
        inputValues[variable.name] = ''
        continue
      }

      const potentialValue = upstreamResult[sourcePortId]
        ?? upstreamResult[variable.name]
        ?? Object.values(upstreamResult)[0]

      // 关键改进点：先检查是否是 Runnable，再调用 .invoke({})
      if (safeIsRunnable(potentialValue)) {
        try {
          console.log(`🔑 变量 [${variable.name}] [${variable.id}] 通过 invoke() 解析:`, potentialValue)
          resolved = await resolveRunnableValue(potentialValue)
          console.log(`🔑 变量 [${variable.name}] 通过 invoke() 解析:`, resolved)
        }
        catch (e) {
          console.error('⚠️ Runnable invoke失败：', e)
          resolved = ''
        }
      }
      else {
        resolved = potentialValue
      }

        // ✅ 新增：如果是 StringPromptValue，提取它的 .value
        if (resolved instanceof StringPromptValue) {
          resolved = resolved.value
        }

      // 如果是AIMessage类型，直接提取 content
      if (resolved && typeof resolved === 'object' && 'content' in resolved) {
        resolved = resolved.content
      }

      // 如果最终是undefined或null，设置为空字符串
      if (resolved === undefined || resolved === null) {
        resolved = ''
      }

      console.log(`✅ 变量 [${variable.name}] 最终值:`, resolved)
    }
    else {
      resolved = (variable.value !== undefined && variable.value !== null && variable.value !== '')
        ? variable.value
        : (variable.defaultValue || '')
      console.log(`🔸 变量 [${variable.name}] 未连接，使用默认值:`, resolved)
    }

    inputValues[variable.name] = typeof resolved === 'string' ? resolved : JSON.stringify(resolved)
  }

  return inputValues
}
