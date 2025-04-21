import type { BuildContext, FlowNode } from '~/types/workflow'
import type { MessageHistoryData } from '~/types/node-data/message-history'
 
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

  // 🧠 获取 memory 对象（通过上游连接）
  const edge = context.json.edges.find((e: any) => e.target === memoryInputVariable.id)
  if (!edge) throw new Error('[MessageHistory] memoryInputVariable 没有连接')

  const sourcePortId = edge.source
  const upstreamNodeId = context.json.nodes[sourcePortId]?.data?.parentNode
  const upstreamResult = context.results?.[upstreamNodeId]
  console.log('messageHistoryFactory', upstreamResult)
  const rawMemory = upstreamResult?.[sourcePortId] ?? Object.values(upstreamResult || {})[0]
  console.log('messageHistoryFactory', rawMemory)
  const memory = typeof rawMemory?.getMessages === 'function'
    ? rawMemory
    : rawMemory?.memory // fallback
console.log('messageHistoryFactory', memory)
  if (!memory || typeof memory.getMessages !== 'function') {
    throw new Error('[MessageHistory] 获取到的 memory 对象不合法或不支持 getMessages()')
  }

  const messages: BaseMessage[] = await memory.getMessages()
  const formattedText = formatMessagesToString(messages)

  return {
    [messageOutputVariable.id]: messages,
    [dataOutputVariable.id]: RunnableLambda.from(() => formattedText),
    [dataframeOutputVariable.id]: RunnableLambda.from(() => formattedText),
  }
}
