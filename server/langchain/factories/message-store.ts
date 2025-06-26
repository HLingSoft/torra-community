import type { BuildContext, LangFlowNode } from '~/types/workflow'
import { BaseMessage } from '@langchain/core/messages'
import { resolveInputVariables, writeLogs } from '../utils'
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
    storedMessagesOutputVariable,
    dataOutputVariable
  } = data

  const t0 = performance.now()

  const inputValues = await resolveInputVariables(context, [
    messageInputVariable,
    memoryInputVariable
  ])
  const memory = inputValues[memoryInputVariable.id]
  const message = inputValues[messageInputVariable.id] as BaseMessage

  await memory.addMessage(message)

  const elapsed = performance.now() - t0

  writeLogs(
    context,
    node.id,
    data.title,
    data.type,
    {
      [storedMessagesOutputVariable.id]: {
        content: message,
        outputPort: storedMessagesOutputVariable,
        elapsed
      },
      [dataOutputVariable.id]: {
        content: message.content,
        outputPort: dataOutputVariable,
        elapsed
      }
    },
    elapsed
  )

  return {
    [storedMessagesOutputVariable.id]: message,
    [dataOutputVariable.id]: message.content
  }
}
