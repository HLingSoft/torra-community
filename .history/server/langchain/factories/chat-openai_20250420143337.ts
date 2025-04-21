import type { ChatOpenAIData } from '@/types/node-data/chat-openai'
import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import { RunnableLambda } from '@langchain/core/runnables'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessage } from '@langchain/core/messages'
import { resolveInputVariables } from '../../langchain/resolveInput'
 

export async function chatOpenAIFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as ChatOpenAIData
  const {
    modelName,
    temperature,
    streaming,
    inputTextVariable,
    systemMessageVariable,
    apiKeyVariable,
    baseURLVariable,
    messageOutputVariable,
    languageModelOutputVariable,
  } = data
  
  const variableDefs = [inputTextVariable, systemMessageVariable, apiKeyVariable, baseURLVariable] as InputPortVariable[]
//  console.log('chat-openai 变量:', context.resolvedInput)

  const inputValues = await resolveInputVariables(context, variableDefs)
  

  const model = new ChatOpenAI({
    modelName,
    temperature,
    streaming,
    openAIApiKey: inputValues[apiKeyVariable.name],
    configuration: { baseURL: inputValues[baseURLVariable.name] },
  })

  const prompt = await ChatPromptTemplate.fromMessages([
    ['system', '{system}'],
    ['human', '{input}'],
  ]).partial({
    input:inputValues[inputTextVariable.name]  ,
    system: inputValues[systemMessageVariable.name],
  })
 

  const chain = prompt.pipe(model)
 
  const messagePortId = messageOutputVariable.id
  const lmPortId = languageModelOutputVariable.id
 
  // 👇 同时返回两个端口
  const result = await chain.invoke({})
 
  return {
 
    [messagePortId]:  new AIMessage(result),

   
    [lmPortId]: model
  }
}
