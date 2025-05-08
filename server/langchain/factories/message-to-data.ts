import type {
  BuildContext,
  FlowNode,
  NodeFactory,
  InputPortVariable,

} from '~/types/workflow'
import type { MessageToDataData } from '@/types/node-data/message-to-data'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

export const messageToDataFactory: NodeFactory = async (
  node: FlowNode,
  context: BuildContext
) => {


  const { inputVariable, outputVariable } = node.data as MessageToDataData




  const variableDefs = [inputVariable] as InputPortVariable[]
  const inputValues = await resolveInputVariables(context, variableDefs)
  // console.log('messageToDataFactory:',inputVariable)
  const result = inputValues[inputVariable.name]


  writeLog(
    context,
    node.id,
    outputVariable.id,
    result,

  )

  return {
    [outputVariable.id]: result ?? '',

  }
}
