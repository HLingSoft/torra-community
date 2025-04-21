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
    const value=inputVariable.value
    console.log('🔍 normalizeToString: 值类型 =', typeof value)
  console.log('🔍 normalizeToString: 构造函数 =', value?.constructor?.name)
  console.log('🔍 normalizeToString: 原始值 =', value)
    console.log('messageToDataFactory:',inputVariable, context.resolvedInput)
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)

    const result= inputValues[ inputVariable.name]
    
    console.log('messageToDataFactory:', result )
  
    return {
      [outputVariable.id]:result ?? '',
    }
  }
  