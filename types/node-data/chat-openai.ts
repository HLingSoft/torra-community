import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface ChatOpenAIData {
  type: string // 节点类型
  title: string
  icon?: string
  description: string
  modelName: string
  temperature?: number
  streaming?: boolean
  systemMessageVariable: InputPortVariable
  inputTextVariable: InputPortVariable
  apiKeyVariable: InputPortVariable
  baseURLVariable: InputPortVariable
  messageOutputVariable: OutputPortVariable
  languageModelOutputVariable: OutputPortVariable

  show?: boolean
  saved?: boolean
}
export const ChatOpenAILangchainName = 'ChatOpenAI' // 节点类型
export const chatOpenAIMeta: ChatOpenAIData = {
  icon: '🤖',
  type: ChatOpenAILangchainName,
  title: 'OpenAI',
  description: 'Generate text using OpenAI LLMs.',
  modelName: 'gpt-4o-mini',
  systemMessageVariable: {
    name: 'systemMessageInput',
    allowedTypes: ['Message'],
    value: '',
    defaultValue: 'You are a helpful assistant.',
    forceStringify: true,
  } as InputPortVariable,

  inputTextVariable: {
    name: 'inputTextInput',
    allowedTypes: ['Message'],
    value: '',
    forceStringify: true,
  } as InputPortVariable,
  apiKeyVariable: {
    name: 'apiKeyInput',
    allowedTypes: ['Message'],
    value: '',
    defaultValue: 'sk-sXW78QiqIJCIc48ueZwg3fIlYmb2PWye22yL13mYOdPxdSiU',
    forceStringify: true,
  } as InputPortVariable,
  baseURLVariable: {
    name: 'baseURLInput',
    allowedTypes: ['Message'],
    value: '',
    defaultValue: 'https://api.openai-proxy.org/v1',
    forceStringify: true,
  } as InputPortVariable,
  messageOutputVariable: {
    outputType: 'Message',

    name: 'messageOutput',
  } as OutputPortVariable,
  languageModelOutputVariable: {
    outputType: 'LanguageModel',
    name: 'languageModelOutput',

  } as OutputPortVariable,

  show: true,
  temperature: 0.2,
  streaming: false,
}
