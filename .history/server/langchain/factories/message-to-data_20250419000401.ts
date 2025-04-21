import type {
    BuildContext,
    FlowNode,
    NodeFactory,
    InputPortVariable,
 
  } from '~/types/workflow'
  import type { BaseMessage } from '@langchain/core/messages'
  import type { MessageToDataData } from '@/types/node-data/message-to-data'
  import { resolveInputVariables } from '../../langchain/resolveInput'
  import { ChatPromptTemplate } from '@langchain/core/prompts'
  function messageToString(message: BaseMessage): string {
    if (!message) return '[Empty message]'
  
    const type = message._getType?.() ?? message.constructor?.name ?? 'Unknown'
    const role = (message as any).role ?? type
    const content = typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content, null, 2)
  
    return `[${role}]: ${content}`
  }
  export const messageToDataFactory: NodeFactory = async (
    node: FlowNode,
    context: BuildContext
  ) => {

    // console.log('messageToDataFactory', node.data)
    // console.log('messageToDataFactory', context.resolvedInput)
    const {inputVariable,outputVariable} = node.data as MessageToDataData
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
  
    const inputVarName =  inputVariable.name
    const message = inputValues[inputVarName]
    console.log('messageToDataFactory:', inputVarName, message)
    const output = messageToString(message)
    console.log('messageToDataFactory:', inputVarName, output)
    // const prompt = ChatPromptTemplate.fromMessages([
    //     ['system', 'Extract content from the following message.'],
   
    //   ])
    
    //   const formatted = await prompt.formatPromptValue({}) // 返回 PromptValue
    //   const output =  formatted.toString()
    
  
    //   console.log('messageToDataFactory:', inputVarName, output)
  
  
    return {
      [outputVariable.id]: output ?? '',
    }
  }
  