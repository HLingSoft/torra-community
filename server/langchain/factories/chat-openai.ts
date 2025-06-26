import type { ChatOpenAIData } from '@/types/node-data/chat-openai'
import type {
  BuildContext,
  LangFlowNode,
  InputPortVariable
} from '~/types/workflow'

import { ChatOpenAI } from '@langchain/openai'
import {
  resolveInputVariables,
  wrapRunnable,
  writeLogs
} from '../utils'
import { RunnableLambda } from '@langchain/core/runnables'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'
import { SafeRunCollectorHandler } from '../../langchain/safeRunCollectorHandler'

interface LanguageModel {
  model: ChatOpenAI
  messages: BaseMessage[]
}

/** ChatOpenAI 节点工厂函数 */
export async function chatOpenAIFactory(
  node: LangFlowNode,
  context: BuildContext
) {

  const t0 = performance.now()
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
  const baseURL = inputValues[baseURLInputVariable.id] || ''
  const collector = new SafeRunCollectorHandler(context.userId, context.workflowId)
  const model = new ChatOpenAI({
    modelName,
    temperature,
    streaming,
    openAIApiKey: inputValues[apiKeyInputVariable.id],
    configuration: {
      baseURL
    },
    callbacks: [collector]
  })

  const messages = [
    new SystemMessage(inputValues[systemMessageInputVariable.id]),
    ...(Array.isArray(inputValues[historyMessageInputVariable.id])
      ? inputValues[historyMessageInputVariable.id]
      : []),
    new HumanMessage(inputValues[inputTextInputVariable.id] || '')
  ] as BaseMessage[]

  // console.log('[ChatOpenAI] messages =', messages)

  const chain = RunnableLambda.from(async (_input, options) => {
    const resultMessage = await model.invoke(messages, options)
    return resultMessage.content
  })

  const messagePortId = messageOutputVariable.id
  const lmPortId = languageModelOutputVariable.id



  // ✅ 包装 message 返回值（异步执行）
  const wrapped = wrapRunnable(chain, node.id, {
    context,
    portId: messagePortId,
    logFormat: res => ({ type: 'chat-openai-message', data: res }),
    outputPort: messageOutputVariable
  })

  const elapsed = performance.now() - t0
  // ✅ 写入语言模型结构输出日志（立即可用的）
  writeLogs(context, node.id, data.title, data.type, {
    [lmPortId]: {
      content: {
        model,
        messages: messages.map(msg => msg.content).slice(0, 200) + '...' // 限制输出长度
      },
      outputPort: languageModelOutputVariable,
      elapsed: elapsed
    }
  }, elapsed)
  return {
    [messagePortId]: wrapped,
    [lmPortId]: {
      model,
      messages
    } as LanguageModel
  }
}
