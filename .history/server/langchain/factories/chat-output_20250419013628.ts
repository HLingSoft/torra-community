import type { ChatOutputData } from '@/types/node-data/chat-output'
import type { BuildContext, FlowNode, InputPortVariable, OutputPortVariable } from '~/types/workflow'

import {  ChatMessage,AIMessage } from '@langchain/core/messages'
 
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function chatOutputFactory(node: FlowNode, context: BuildContext) {
  const {
    inputVariable,
    outputVariable,
  } = node.data as ChatOutputData
 
 
  const variableDefs = [inputVariable] as InputPortVariable[]
  

  const inputValues = await resolveInputVariables(context, variableDefs)
 
  return {
    // 端口1: 提供可执行 chain(最终会返回 Message)
    [outputVariable.id]: new AIMessage(inputValues[inputVariable.name]),
  }
}
