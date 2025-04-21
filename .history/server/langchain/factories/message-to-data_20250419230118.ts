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
  
  
  
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
    console.log('messageToDataFactory:',inputVariable)
    const result = inputValues[inputVariable.name]

    // console.log('🔍 normalizeToString: 值类型 =', typeof result)
    // console.log('🔍 normalizeToString: 构造函数 =', result?.constructor?.name)
    // console.log('🔍 normalizeToString: 原始值 =', result)

    // const result= inputValues[ inputVariable.name]
    
    console.log('messageToDataFactory:', result )  
  
    return {
      [outputVariable.id]:result ?? '',
    }
  }
  