import type { BuildContext, LangFlowNode, InputPortVariable } from '~/types/workflow'
import type { MessageHistoryData } from '@/types/node-data/message-history'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages'

/**
 * 格式化消息数组为可读字符串，每条最多500字符
 */
function formatMessagesToString(messages: BaseMessage[]): string {
  return messages
    .map((msg) => {
      let role = 'unknown'
      if (msg instanceof HumanMessage) role = 'Human'
      else if (msg instanceof AIMessage) role = 'AI'
      else if (msg instanceof SystemMessage) role = 'System'

      let content = typeof msg.content === 'string' ? msg.content : String(msg.content)
      if (content.length > 500) {
        content = content.slice(0, 500) + '...'
      }
      return `${role}: ${content}`
    })
    .join('\n')
}

/**
 * MessageHistory 节点工厂函数
 */
export async function messageHistoryFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const data = node.data as MessageHistoryData
  const {
    maxMessages,
    memoryInputVariable,
    messageOutputVariable,
    dataOutputVariable
  } = data

  // 1. 解析 memory 输入变量
  const inputValues = await resolveInputVariables(context, [memoryInputVariable])
  const memory = inputValues[memoryInputVariable.id] as { getMessages: () => Promise<BaseMessage[]> }

  // 2. 获取历史消息
  let messages: BaseMessage[] = []
  try {
    messages = await memory.getMessages()
    // 如有 maxMessages 参数，仅保留最近 N 条
    if (typeof maxMessages === 'number' && maxMessages > 0) {
      messages = messages.slice(-maxMessages)
    }
  } catch (e) {
    console.error('MessageHistoryFactory 错误:', e)
  }

  // 3. 格式化字符串形式，写日志
  const formattedText = formatMessagesToString(messages)
  // writeLog(context, node.id, messageOutputVariable.id, formattedText)

  // 4. 返回原始数组与字符串结果
  return {
    [messageOutputVariable.id]: messages,
    [dataOutputVariable.id]: formattedText
  }
}
