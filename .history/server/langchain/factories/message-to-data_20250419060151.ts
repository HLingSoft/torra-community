import type {
    BuildContext,
    FlowNode,
    NodeFactory,
    InputPortVariable,
 
  } from '~/types/workflow'
  import type { MessageToDataData } from '@/types/node-data/message-to-data'
  import { resolveInputVariables } from '../../langchain/resolveInput'
  
  export const messageToDataFactory: NodeFactory = async (
    node: FlowNode,
    context: BuildContext
  ) => {

    console.log('messageToDataFactory:', context.resolvedInput)
    const {inputVariable,outputVariable} = node.data as MessageToDataData
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)

    const result= inputValues[ inputVariable.name]
    
    console.log('messageToDataFactory:', result )
  
    return {
      [outputVariable.id]:result ?? '',
    }
  }
  