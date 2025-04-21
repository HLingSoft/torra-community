import type { BuildContext, FlowNode } from '~/types/workflow'
import type { BaseMessage } from '@langchain/core/messages'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { MessageStoreData } from '@/types/node-data/message-store'

export async function messageStoreFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageStoreData
  const {
    messageInputVariable,
    memoryInputVariable,
    storedMessagesOutputVariable,
  } = data
  console.log('🔗 [MessageStore] 变量:', data)
  const inputValues = await resolveInputVariables(context, [messageInputVariable])
      const message = inputValues[messageInputVariable.name]
      console.log('[MessageStore] 变量:', message)
  // --- 获取 memory 对象（来自 upstream）
  const memoryEdge = context.json.edges.find((e:any) => e.target === memoryInputVariable.id)
  const memoryNodeId = context.json.nodes[memoryEdge?.source]?.data?.parentNode
  const memory = context.results?.[memoryNodeId]?.[memoryEdge?.source]
  console.log('[MessageStore] 变量:', memory)

  // --- 获取 message 对象（来自 upstream）
  // const messageEdge = context.json.edges.find((e:any) => e.target === messageInputVariable.id)
  // const messageNodeId = context.json.nodes[messageEdge?.source]?.data?.parentNode
  // const message = context.results?.[messageNodeId]?.[messageEdge?.source] as BaseMessage

  if (!memory || typeof memory.addMessage !== 'function') {
    throw new Error('[MessageStore] 无法解析 memory 或 memory 不支持 addMessage()')
  }

  // if (!message || typeof message !== 'object' || !message.content) {
  //   throw new Error('[MessageStore] 无效的 message 输入')
  // }

  // --- 存入 memory
  await memory.addMessage(message)

  return {
    [storedMessagesOutputVariable.id]: [message],
  }
}
