import type { ChatOpenAIData } from '@/types/node-data/chat-openai'
import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
// import { RunnableLambda } from '@langchain/core/runnables'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
// import { AIMessage } from '@langchain/core/messages'
import { resolveInputVariables, wrapRunnable } from '../../langchain/resolveInput'


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


  const chain = prompt.pipe(model)



  const messagePortId = messageOutputVariable.id
  const lmPortId = languageModelOutputVariable.id


  return {

    // [messagePortId]: chain,
    [messagePortId]: wrapRunnable(
      chain,                // runnable
      node.id,              // nodeId
      context.onRunnableElapsed, // 回调（可能是 undefined）
    ),


    [lmPortId]: chain
  }
}
