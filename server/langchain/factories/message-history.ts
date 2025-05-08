import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { MessageHistoryData } from '~/types/node-data/message-history'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'
// import { RunnableLambda } from '@langchain/core/runnables'
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages'
function formatMessagesToString(messages: BaseMessage[]): string {
  return messages
    .map((msg) => {
      let role = 'unknown';
      if (msg instanceof HumanMessage) role = 'Human';
      else if (msg instanceof AIMessage) role = 'AI';
      else if (msg instanceof SystemMessage) role = 'System';

      // 获取消息内容
      let content = typeof msg.content === 'string' ? msg.content : String(msg.content);

      // 截断内容至最多 200 个字符
      if (content.length > 500) {
        content = content.slice(0, 500) + '...';
      }

      return `${role}: ${content}`;
    })
    .join('\n');
}

export async function messageHistoryFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageHistoryData
  const {
    maxMessages,
    memoryInputVariable,
    messageOutputVariable,
    dataOutputVariable,
    dataframeOutputVariable,
  } = data

  // const memory = await getMemory(context, memoryInputVariable,m)

  const inputValues = await resolveInputVariables(context, [memoryInputVariable])
  const memory = inputValues[memoryInputVariable.name] as any
  // console.log('messageHistoryFactory', memory)
  // await memory.clear()

  // console.log('messageHistoryFactory', memory)
  let messages: BaseMessage[] = []
  try {
    messages = await memory.getMessages()
    // const formattedText = formatMessagesToString(messages)
    // console.log('messageHistoryFactory 1 ', formattedText)
    // 如果设置了 maxMessages，则截取最后的 maxMessages 条消息
    if (typeof maxMessages === 'number' && maxMessages > 0) {
      messages = messages.slice(-maxMessages);
    }
    // const formattedText = formatMessagesToString(messages)
    // console.log('messageHistoryFactory', formattedText)
  } catch (e) {
    console.error('MessageHistory 错误:', e)
  }

  // console.log('messageHistoryFactory', messages)
  const formattedText = formatMessagesToString(messages)
  writeLog(
    context,
    node.id,
    messageOutputVariable.id,
    formattedText,

  )
  // console.log('messageHistoryFactory 2', formattedText)

  return {
    [messageOutputVariable.id]: formattedText,
    [dataOutputVariable.id]: formattedText,
    [dataframeOutputVariable.id]: formattedText,
  }
}
