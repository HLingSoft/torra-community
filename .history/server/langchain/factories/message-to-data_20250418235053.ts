import type {
    BuildContext,
    FlowNode,
    NodeFactory,
    InputPortVariable,
 
  } from '~/types/workflow'
  
  import type { MessageToDataData } from '@/types/node-data/message-to-data'
  import { resolveInputVariables } from '../../langchain/resolveInput'
  import { ChatPromptTemplate } from '@langchain/core/prompts'
  
  export const messageToDataFactory: NodeFactory = async (
    node: FlowNode,
    context: BuildContext
  ) => {
    const {inputVariable,outputVariable} = node.data as MessageToDataData
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
  
    const inputVarName =  inputVariable.name
    const message = inputValues[inputVarName]

    const prompt = ChatPromptTemplate.fromMessages([
        message // 👈 直接放入你的 Message 对象
      ])
    
      const formatted = await prompt.formatPromptValue({}) // 返回 PromptValue
      const output =  formatted.toString()
    
  
      console.log('messageToDataFactory:', inputVarName, output)
  
  
    return {
      [outputVariable.id]: output ?? '',
    }
  }
  