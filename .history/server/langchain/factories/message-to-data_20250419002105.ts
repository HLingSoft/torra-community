import type {
    BuildContext,
    FlowNode,
    NodeFactory,
    InputPortVariable,
 
  } from '~/types/workflow'
  import { ChatMessage, HumanMessage, type BaseMessage } from '@langchain/core/messages'
  import type { MessageToDataData } from '@/types/node-data/message-to-data'
  import { resolveInputVariables } from '../../langchain/resolveInput'
  import { ChatPromptTemplate } from '@langchain/core/prompts'
  import { load } from '@langchain/core/load';
   
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
    const message = JSON.parse(JSON.stringify(inputValues[inputVarName]))
   
   console.log(message.kwargs, await load(JSON.stringify(inputValues[inputVarName])) )
   
    const realMessage =  new ChatMessage(  message.kwargs)
 
    // console.log('messageToDataFactory:', realMessage)
    const prompt = ChatPromptTemplate.fromMessages([realMessage])
const formatted = await prompt.formatPromptValue({})
const result = formatted.toString()
    // console.log('messageToDataFactory:', inputVarName, message)
    // const output = await messageToString(realMessage)
    // console.log('messageToDataFactory:', inputVarName, output)
    // const prompt = ChatPromptTemplate.fromMessages([
    //     ['system', 'Extract content from the following message.'],
   
    //   ])
    
    //   const formatted = await prompt.formatPromptValue({}) // 返回 PromptValue
    //   const output =  formatted.toString()
    
  
    //   console.log('messageToDataFactory:', inputVarName, output)
  
  
    return {
      [outputVariable.id]: result ?? '',
    }
  }
  