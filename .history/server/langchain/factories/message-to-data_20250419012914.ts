import type {
    BuildContext,
    FlowNode,
    NodeFactory,
    InputPortVariable,
 
  } from '~/types/workflow'
  import { AIMessage, ChatMessage, HumanMessage, type BaseMessage } from '@langchain/core/messages'
  import type { MessageToDataData } from '@/types/node-data/message-to-data'
  import { resolveInputVariables,normalizeToString } from '../../langchain/resolveInput'
  import { ChatPromptTemplate } from '@langchain/core/prompts'
  import { load } from '@langchain/core/load';
  import { getBufferString } from '@langchain/core/messages';
   
  export const messageToDataFactory: NodeFactory = async (
    node: FlowNode,
    context: BuildContext
  ) => {

    // console.log('messageToDataFactory', node.data)
    // console.log('messageToDataFactory', context.resolvedInput)
    const {inputVariable,outputVariable} = node.data as MessageToDataData
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
    const result=normalizeToString( inputValues[ inputVariable.name])
    // const inputVarName =  inputVariable.name

    // const prompt = await ChatPromptTemplate.fromMessages([
        
    //     ['human', '{input}'],
    //   ]).partial({
    //     input:normalizeToString( inputValues[ inputVariable.name]),
       
    //   })
    //   const finalPrompt = await prompt.invoke({})
    //     console.log('messageToDataFactory:', finalPrompt)

    // const messages = [
    //     new HumanMessage("你好"),
    //     new AIMessage("你好，我是 AI"),
    //     inputValues[inputVarName]
    //   ]
      
    //   const output = getBufferString(messages)
      
    //   console.log(output)
   
    // const message = await load(JSON.stringify(inputValues[inputVarName])) as BaseMessage

    // console.log(message.toDict().data,    getBufferString([message]))

    // const textMessage = await load(JSON.stringify((new AIMessage('你是谁').toJSON()))) as BaseMessage
    // console.log(textMessage.content)
   
//    console.log(message.kwargs,  )
   
    // const realMessage =  new ChatMessage(  message.kwargs)
 
    // console.log('messageToDataFactory:', realMessage)
    // const prompt = ChatPromptTemplate.fromMessages([realMessage])
// const formatted = await prompt.formatPromptValue({})
// const result = formatted.toString()
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
  