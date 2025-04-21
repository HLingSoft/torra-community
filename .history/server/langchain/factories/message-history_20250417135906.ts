import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { MessageHistoryData } from './types'
import { resolveInputVariables } from '../../langchain/resolveInput'

// 用于读取内存中对话历史的函数（封装，简化 mock）
async function getMemoryMessages(memory: any) {
  if (!memory?.chatHistory?.getMessages) {
    throw new Error('[MessageHistory] memory 对象无效或不支持 getMessages')
  }

  const messages = await memory.chatHistory.getMessages()
  return messages
}

export async function messageHistoryFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageHistoryData

  const { memoryInputVariable, messageOutputVariable, dataOutputVariable, dataframeOutputVariable } = data
  const variableDefs = [memoryInputVariable]
  const inputValues = await resolveInputVariables(context, variableDefs)

  const memory = inputValues[memoryInputVariable.name]

  if (!memory) throw new Error('[MessageHistory] 无法获取 memory 输入')

  const messages = await getMemoryMessages(memory)

  return {
    [messageOutputVariable.id]: messages, // 通常格式为 BaseMessage[]，你下游再格式化
    [dataOutputVariable.id]: messages,
    [dataframeOutputVariable.id]: messages,
  }
}
