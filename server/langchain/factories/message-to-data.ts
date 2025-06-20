import type {
  BuildContext,
  LangFlowNode,
  NodeFactory,
  InputPortVariable
} from '~/types/workflow'
import type { MessageToDataData } from '@/types/node-data/message-to-data'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

/**
 * MessageToData 节点工厂函数
 */
export const messageToDataFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const { inputInputVariable, outputVariable } = node.data as MessageToDataData

  const variableDefs = [inputInputVariable] as InputPortVariable[]
  const inputValues = await resolveInputVariables(context, variableDefs)
  // console.log('messageToDataFactory', inputValues)

  const result = inputValues[inputInputVariable.id]

  // writeLog(
  //   context,
  //   node.id,
  //   outputVariable.id,
  //   result
  // )

  return {
    [outputVariable.id]: result.content ?? ''
  }
}
