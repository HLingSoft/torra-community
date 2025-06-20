import type { ChatOpenAIData } from '@/types/node-data/chat-openai'
import type {
  BuildContext,
  LangFlowNode,
  InputPortVariable,
  OutputPortVariable
} from '~/types/workflow'

import { ChatOpenAI } from '@langchain/openai'
import {
  resolveInputVariables,
  wrapRunnable
} from '../../langchain/resolveInput'
import { RunnableLambda } from '@langchain/core/runnables'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'

interface LanguageModel {
  model: ChatOpenAI
  messages: BaseMessage[]
}

/** ChatOpenAI 节点工厂函数 */
export async function chatOpenAIFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const data = node.data as ChatOpenAIData
  const {
    modelName,
    historyMessageInputVariable,
    temperature,
    streaming,
    inputTextInputVariable,
    systemMessageInputVariable,
    apiKeyInputVariable,
    baseURLInputVariable,
    messageOutputVariable,
    languageModelOutputVariable
  } = data

  const variableDefs: InputPortVariable[] = [
    inputTextInputVariable,
    systemMessageInputVariable,
    apiKeyInputVariable,
    baseURLInputVariable,
    historyMessageInputVariable
  ]

  const inputValues = await resolveInputVariables(context, variableDefs)
  // console.log('ChatOpenAI 节点解析的输入变量:', inputValues)

  const model = new ChatOpenAI({
    modelName,
    temperature,
    streaming,
    openAIApiKey: inputValues[apiKeyInputVariable.id],
    configuration: {
      baseURL: inputValues[baseURLInputVariable.id]
    }
  })


  const messages = [
    new SystemMessage(inputValues[systemMessageInputVariable.id]),
    ...(Array.isArray(inputValues[historyMessageInputVariable.id])
      ? inputValues[historyMessageInputVariable.id]
      : []),
    new HumanMessage(inputValues[inputTextInputVariable.id] || '')

  ]

  const chain = RunnableLambda.from(async (_input, options) => {
    const resultMessage = await model.invoke(messages, options)

    return resultMessage.content
  })

  const messagePortId = messageOutputVariable.id
  const lmPortId = languageModelOutputVariable.id

  const wrapped = wrapRunnable(chain, node.id, context.onRunnableElapsed, {
    context,
    portId: messagePortId,

    logFormat: res => ({
      type: 'openai chat',
      data: res
    })
  })

  return {
    [messagePortId]: wrapped,
    [lmPortId]: {
      model,
      messages
    } as LanguageModel
  }
}
