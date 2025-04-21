import type { ChatOpenAIData } from '@/types/node-data/chat-openai'
import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'

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
  console.log('🔗 [OpenAI] 变量:', data)
  const variableDefs = [inputTextVariable, systemMessageVariable, apiKeyVariable, baseURLVariable] as InputPortVariable[]
  const variableNames = variableDefs.map(v => v.name)
  console.log('🔗 [OpenAI] 变量:', variableNames)

  const inputValues = await resolveInputVariables(context, variableDefs)
  console.log('✅ ChatOpenAI 输入变量: systemMessageVariable', inputValues[inputTextVariable.name])

  console.log('✅ ChatOpenAI 输入变量: systemMessageVariable', inputValues[systemMessageVariable.name])

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

  // return prompt.pipe(model)
  // 组合成 chain(可执行runnable)
  // const finalPrompt = await prompt.invoke({})

  // // 打印结构化结果
  // console.log('📝 prompt.invoke 结果:', finalPrompt)
  const chain = prompt.pipe(model)

  // 如果 outputVariable 没有 id，就给个默认
  const messagePortId = messageOutputVariable.id
  const lmPortId = languageModelOutputVariable.id
  // 👇 同时返回两个端口
  return {
    // 端口1: 提供可执行 chain(最终会返回 Message)
    [messagePortId]: chain,

    // 端口2: 提供 model 本身(可能作为下游 if needed)
    [lmPortId]: model,
  }
}
