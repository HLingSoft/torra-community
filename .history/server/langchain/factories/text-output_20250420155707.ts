import type { TextOutputData } from '@/types/node-data/text-output'
import type { BuildContext, FlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'
import { resolveInputVariables } from '../../langchain/resolveInput'
 
export const textOutputFactory: NodeFactory = async (node: FlowNode, context: BuildContext) => {
  const data = node.data as TextOutputData
  const variableDefs = [data.inputVariable] as InputPortVariable[]
  const variableNames = variableDefs.map(v => v.name)

  const inputValues = await resolveInputVariables(context, variableDefs)

  const outputVar = data.outputVariable as OutputPortVariable

 
  const outputPortId = outputVar.id
  
  return {
  
    [outputPortId]: inputValues[variableNames[0]],
  }
 
}
