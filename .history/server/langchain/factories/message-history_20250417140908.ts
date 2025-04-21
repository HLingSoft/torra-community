import type { BuildContext, FlowNode } from '~/types/workflow'
import type { MessageHistoryData } from '~/types/node-data/message-history'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { BaseMessage } from '@langchain/core/messages'

function formatMessagesToString(messages: BaseMessage[]): string {
  return messages
    .map((msg) => {
      const role = msg._getType?.() ?? msg.role ?? 'unknown'
      return `${role}: ${msg.content}`
    })
    .join('\n')
}

export async function messageHistoryFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageHistoryData
  const {
    memoryInputVariable,
    messageOutputVariable,
    dataOutputVariable,
    dataframeOutputVariable,
  } = data

  const variableDefs = [memoryInputVariable]
  const inputValues = await resolveInputVariables(context, variableDefs)

  const memory = inputValues[memoryInputVariable.name]

  if (!memory || typeof memory.getMessages !== 'function') {
    throw new Error('[MessageHistory] memory 对象无效或不支持 getMessages 方法')
  }

  const messages: BaseMessage[] = await memory.getMessages()

  const textOutput = formatMessagesToString(messages)

  return {
    [messageOutputVariable.id]: messages,
    [dataOutputVariable.id]: textOutput,
    [dataframeOutputVariable.id]: textOutput,
  }
}
