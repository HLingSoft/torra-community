import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { MessageHistoryData } from '~/types/node-data/message-history'
 import { resolveInputVariables } from '../../langchain/resolveInput'
import { RunnableLambda } from '@langchain/core/runnables'
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

  // const memory = await getMemory(context, memoryInputVariable,m)
   const inputValues = await resolveInputVariables(context, [memoryInputVariable])
  const memory = inputValues[memoryInputVariable.name] as any
  const messages: BaseMessage[] = await memory.getMessages()
  const formattedText = formatMessagesToString(messages)
  console.log('messageHistoryFactory', formattedText)

  return {
    [messageOutputVariable.id]: messages,
    [dataOutputVariable.id]: RunnableLambda.from(() => formattedText),
    [dataframeOutputVariable.id]: RunnableLambda.from(() => formattedText),
  }
}
