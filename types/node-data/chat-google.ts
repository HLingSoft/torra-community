import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ChatGoogleGenerativeAIData {
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
export const ChatGoogleGenerativeAILangchainName = 'ChatGoogleGenerativeAI' // 节点类型
export const chatGoogleGenerativeAIMeta: ChatGoogleGenerativeAIData = {
    icon: 'hugeicons:google-gemini',
    type: ChatGoogleGenerativeAILangchainName,
    title: 'Google Generative AI',
    description: 'Generate text using Google Generative AI.',
    modelName: 'gemini-2.5-pro',
    temperature: 0.2,

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
        name: 'Google API Key',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: '',

    } as InputPortVariable,
    baseURLInputVariable: {
        name: 'Google API URL',
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

    streaming: false,
}
