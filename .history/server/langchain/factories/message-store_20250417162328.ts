import type { BuildContext, FlowNode } from '~/types/workflow'
import type { BaseMessage } from '@langchain/core/messages'
import type { MessageStoreData } from '@/types/node-data/message-store'
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function messageStoreFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageStoreData
  const {
    messageInputVariable,
    memoryInputVariable,
    storedMessagesOutputVariable,
  } = data

  // 获取上游输入值
  const variableDefs = [messageInputVariable, memoryInputVariable]
  const inputValues = await resolveInputVariables(context, variableDefs)

  const message = inputValues[messageInputVariable.name] as BaseMessage
  const memory = inputValues[memoryInputVariable.name]

  if (!memory || typeof memory.addMessage !== 'function') {
    throw new Error('[MessageStore] memory 对象无效或缺少 addMessage 方法')
  }

  if (!message || typeof message !== 'object' || !message.content) {
    throw new Error('[MessageStore] message 输入无效')
  }

  // 存入 memory
  await memory.addMessage(message)

  // 可选：返回已存储消息（这里简化为原样返回）
  return {
    [storedMessagesOutputVariable.id]: [message],
  }
}
