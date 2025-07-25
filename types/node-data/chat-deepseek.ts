import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ChatDeepSeekData {
    type: string // 节点类型
    title: string
    icon?: string
    description: string
    modelName: string
    temperature?: number
    streaming?: boolean
    systemMessageInputVariable: InputPortVariable
    historyMessageInputVariable: InputPortVariable,
    inputTextInputVariable: InputPortVariable
    apiKeyInputVariable: InputPortVariable

    messageOutputVariable: OutputPortVariable
    languageModelOutputVariable: OutputPortVariable

    show?: boolean
    saved?: boolean
}
export const ChatDeepSeekLangchainName = 'ChatDeepSeek' // 节点类型
export const chatDeepSeekMeta: ChatDeepSeekData = {
    icon: 'arcticons:deepseek',
    type: ChatDeepSeekLangchainName,
    title: 'DeepSeek',
    description: 'Generate text using DeepSeek LLMs.',
    modelName: 'deepseek-chat',
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
        name: 'DeepSeek API Key',
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
