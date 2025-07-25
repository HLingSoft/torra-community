import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ChatOpenAIData {
  type: string // 节点类型
  title: string
  icon?: string
  description: string
  modelName: string
  temperature?: number
  streaming?: boolean
  systemMessageInputVariable: InputPortVariable
  historyMessageInputVariable: InputPortVariable
  inputTextInputVariable: InputPortVariable
  apiKeyInputVariable: InputPortVariable
  baseURLInputVariable: InputPortVariable
  messageOutputVariable: OutputPortVariable
  languageModelOutputVariable: OutputPortVariable

  show?: boolean
  saved?: boolean
}
export const ChatOpenAILangchainName = 'ChatOpenAI' // 节点类型
export const chatOpenAIMeta: ChatOpenAIData = {
  icon: 'arcticons:openai-chatgpt',
  type: ChatOpenAILangchainName,
  title: 'OpenAI',
  description: 'Generate text using OpenAI LLMs.',
  modelName: 'o3',
  systemMessageInputVariable: {
    name: 'System Instruction',
    allowedTypes: ['Data'],
    value: '',
    defaultValue: 'You are a helpful assistant.',

  } as InputPortVariable,
  historyMessageInputVariable: {
    name: 'History Message',
    allowedTypes: ['Message[]'],

  } as InputPortVariable,

  inputTextInputVariable: {
    name: 'Input',
    allowedTypes: ['Data'],
    value: '',

  } as InputPortVariable,
  apiKeyInputVariable: {
    name: 'OpenAI API Key',
    allowedTypes: ['Data'],
    value: '',
    defaultValue: '',

  } as InputPortVariable,
  baseURLInputVariable: {
    name: 'Request Base URL',
    allowedTypes: ['Data'],
    value: '',
    defaultValue: '',

  } as InputPortVariable,
  messageOutputVariable: {
    outputType: 'Data',
    name: 'Return Data',
  } as OutputPortVariable,
  languageModelOutputVariable: {
    outputType: 'LanguageModel',
    name: 'Return Language Model',

  } as OutputPortVariable,

  show: true,
  temperature: 0.2,
  streaming: false,
}
