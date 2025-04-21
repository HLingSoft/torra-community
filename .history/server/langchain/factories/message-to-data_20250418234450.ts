import type {
    BuildContext,
    FlowNode,
    NodeFactory,
    InputPortVariable,
    OutputPortVariable,
  } from '~/types/workflow'
  
  import type { MessageToDataData } from '@/types/node-data/message-to-data'
  import { resolveInputVariables } from '../../langchain/resolveInput'
  import { extractMessageContent } from '../../langchain/utils/extractMessageContent' // 你刚写的工具函数
  
  export const messageToDataFactory: NodeFactory = async (
    node: FlowNode,
    context: BuildContext
  ) => {
    const data = node.data as MessageToDataData
  
    const variableDefs = [data.inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
  
    const inputVarName = data.inputVariable.name
    const message = inputValues[inputVarName]
  
    const extracted = extractMessageContent(message)
    const outputPortId = data.outputVariable.id
  
    return {
      [outputPortId]: extracted ?? '',
    }
  }
  