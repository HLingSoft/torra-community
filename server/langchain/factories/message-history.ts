import type { BuildContext, LangFlowNode, InputPortVariable } from '~/types/workflow'
import type { MessageHistoryData } from '@/types/node-data/message-history'
import { resolveInputVariables, writeLogs } from '../utils'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages'

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

  const t0 = performance.now()

  const inputValues = await resolveInputVariables(context, [memoryInputVariable])
  const memory = inputValues[memoryInputVariable.id] as { getMessages: () => Promise<BaseMessage[]> }

  let messages: BaseMessage[] = []
  try {
    messages = await memory.getMessages()
    if (typeof maxMessages === 'number' && maxMessages > 0) {
      messages = messages.slice(-maxMessages)
    }
  } catch (e) {
    console.error('MessageHistoryFactory 错误:', e)
  }

  const formattedText = formatMessagesToString(messages)

  const elapsed = performance.now() - t0

  // ✅ 结构化写日志
  writeLogs(
    context,
    node.id,
    data.title,
    data.type,
    {
      [messageOutputVariable.id]: {
        content: messages,
        outputPort: messageOutputVariable,
        elapsed
      },
      [dataOutputVariable.id]: {
        content: formattedText,
        outputPort: dataOutputVariable,
        elapsed
      }
    },
    elapsed
  )

  return {
    [messageOutputVariable.id]: messages,
    [dataOutputVariable.id]: formattedText
  }
}
