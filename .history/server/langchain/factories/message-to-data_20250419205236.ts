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

   
    const {inputVariable,outputVariable} = node.data as MessageToDataData
    console.log('messageToDataFactory:',inputVariable, context.resolvedInput)
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)

    const result= inputValues[ inputVariable.name]
    
    console.log('messageToDataFactory:', result )
  
    return {
      [outputVariable.id]:result ?? '',
    }
  }
  