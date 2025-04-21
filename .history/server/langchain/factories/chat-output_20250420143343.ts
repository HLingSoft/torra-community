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
     
    [outputVariable.id]: new AIMessage(inputValues[inputVariable.name]),
  }
}


//if-esle 里面的代码有问题
//这里chatOutputFactory打印出来是空的{ input: '' }
