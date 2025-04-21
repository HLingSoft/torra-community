import type { ChatOpenAIData } from '@/types/node-data/chat-openai'
import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import { RunnableLambda } from '@langchain/core/runnables'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'

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
    input: inputValues[inputTextVariable.name],
    system: inputValues[systemMessageVariable.name],
  })
  // console.log('chat-openai inputValues[inputTextVariable.name]:', inputValues[inputTextVariable.name])

  // return prompt.pipe(model)
  // 组合成 chain(可执行runnable)

  const chain = prompt.pipe(model)

  // const finalMessages = await prompt.formatMessages({})
  // console.log('chat-openai final prompt:', finalMessages)

  // // 打印结构化结果
  // console.log('📝 prompt.invoke 结果:', await chain.invoke({}))
  // 如果 outputVariable 没有 id，就给个默认
  const messagePortId = messageOutputVariable.id
  const lmPortId = languageModelOutputVariable.id
  // console.log('lmPortId', model.invoke())
  // 👇 同时返回两个端口
  return {
    // 端口1: 提供可执行 chain(最终会返回 Message)
    [messagePortId]: chain,

    // 端口2: 提供 model 本身(可能作为下游 if needed)
    [lmPortId]: model
  }
}
