import type { InputPortVariable, LangFlowJson } from '~/types/workflow'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages'
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


// 🎯 统一转为 ChatMessage[]
 function normalizeToChatMessages(value: any): BaseMessage[] {
  if (Array.isArray(value) && value.every(v => v?.content)) return value as BaseMessage[]
  if (value instanceof StringPromptValue) return [new HumanMessage(value.value)]
  if (typeof value === 'string') return [new HumanMessage(value)]
  if (value?.content) return [value as BaseMessage]
  return [new HumanMessage(JSON.stringify(value))]
}

// 改进后的 resolveInputVariables
export async function resolveInputVariables(
  context: Record<string, any>,
  variables: InputPortVariable[],
): Promise<Record<string, string>> {
  const inputValues: Record<string, string> = {}

  for (const variable of variables) {
    console.log(`🔑 解析变量 [${variable.name}]，连接状态:`, variable)
    let resolved: any = ''

    const portId = variable.id

    if (variable.connected) {
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
          resolved = await potentialValue.invoke({})
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
