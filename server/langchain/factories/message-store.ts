import type { BuildContext, LangFlowNode } from '~/types/workflow'
import { BaseMessage } from '@langchain/core/messages'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'
import type { MessageStoreData } from '@/types/node-data/message-store'

/**
 * MessageStore 节点工厂函数
 */
export async function messageStoreFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const data = node.data as MessageStoreData
  const {
    messageInputVariable,
    memoryInputVariable,
    // role,
    storedMessagesOutputVariable,
    dataOutputVariable
  } = data

  // 解析输入变量
  const inputValues = await resolveInputVariables(context, [
    messageInputVariable,
    memoryInputVariable
  ])
  const memory = inputValues[memoryInputVariable.id]
  const message = inputValues[messageInputVariable.id] as BaseMessage
  // console.log('MessageStore 节点解析的输入变量:', memory)
  // let storedMessage: HumanMessage | AIMessage | undefined = undefined;
  await memory.addMessage(message)

  // try {
  //   if (message) {
  //     if (role === 'Human') {
  //       storedMessage = new HumanMessage(message)
  //       await memory.addMessage(storedMessage)
  //     } else {
  //       storedMessage = new AIMessage(message)
  //       await memory.addMessage(storedMessage)
  //     }
  //   }
  // } catch (e) {
  //   console.error('MessageStore 错误:', e, node.data.title)
  // }

  // writeLog(
  //   context,
  //   node.id,
  //   storedMessagesOutputVariable.id,
  //   `UpstashRedisChatMessageStore   ${message}`
  // )

  return {
    [storedMessagesOutputVariable.id]: message,
    [dataOutputVariable.id]: message.content

  }
}
