import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ChatAnthropicData {
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
export const ChatAnthropicLangchainName = 'ChatAnthropic' // 节点类型
export const chatAnthropicMeta: ChatAnthropicData = {
    icon: 'logos:anthropic-icon',
    type: ChatAnthropicLangchainName,
    title: 'Anthropic',
    description: 'Generate text using Anthropic Chat & Completion LLMs with prefill support.',
    modelName: 'claude-sonnet-4-0',
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
        name: 'Anthropic API Key',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: '',

    } as InputPortVariable,
    baseURLInputVariable: {
        name: 'Anthropic API URL',
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
