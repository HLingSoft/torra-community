import type { ChatOutputData } from '@/types/node-data/chat-output'
import type { BuildContext, FlowNode, InputPortVariable, OutputPortVariable } from '~/types/workflow'

import { AIMessage } from '@langchain/core/messages'

import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

export async function chatOutputFactory(node: FlowNode, context: BuildContext) {
  const {
    inputVariable,
    outputVariable,
  } = node.data as ChatOutputData


  const variableDefs = [inputVariable] as InputPortVariable[]


  const inputValues = await resolveInputVariables(context, variableDefs)

  writeLog(
    context,
    node.id,
    outputVariable.id,
    inputValues[inputVariable.name],

  )

  return {

    [outputVariable.id]: new AIMessage(inputValues[inputVariable.name]),

  }
}



