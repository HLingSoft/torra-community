import type { ChatOutputData } from '@/types/node-data/chat-output'
import type {
  BuildContext,
  LangFlowNode,
  InputPortVariable,

} from '~/types/workflow'


import {
  resolveInputVariables,

} from '../../langchain/resolveInput'

/** ChatOutput 节点工厂函数 */
export async function chatOutputFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const data = node.data as ChatOutputData
  const {
    inputInputVariable,
    outputVariable
  } = data

  const variableDefs: InputPortVariable[] = [inputInputVariable]

  const inputValues = await resolveInputVariables(context, variableDefs)

  const inputValue = inputValues[inputInputVariable.id]
  const outputPortId = outputVariable.id


  return {
    [outputPortId]: inputValue,
    default: inputValue
  }
}
