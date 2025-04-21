import type { TextInputData } from '@/types/node-data/text-input'
import type { BuildContext, FlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { HumanMessage } from '@langchain/core/messages'
import { resolveInputVariables } from '../../langchain/resolveInput'
 
export const textInputFactory: NodeFactory = async (node: FlowNode, context: BuildContext) => {
  const data = node.data as TextInputData
  const variableDefs = [data.inputVariable] as InputPortVariable[]
  const variableNames = variableDefs.map(v => v.name)

  const inputValues = await resolveInputVariables(context, variableDefs)

  const outputVar = data.outputVariable as OutputPortVariable

 
  const outputPortId = outputVar.id
  
  return {
  
    [outputPortId]: inputValues[variableNames[0]],
  }
 
}
