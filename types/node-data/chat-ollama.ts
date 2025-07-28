import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ChatOllamaData {
    type: string // 节点类型
    title: string
    icon?: string
    description: string

    temperature?: number
    streaming?: boolean
    modelNameInputVariable: InputPortVariable
    baseURLInputVariable: InputPortVariable,
    systemMessageInputVariable: InputPortVariable
    historyMessageInputVariable: InputPortVariable,
    inputTextInputVariable: InputPortVariable
    messageOutputVariable: OutputPortVariable
    languageModelOutputVariable: OutputPortVariable

    show?: boolean
    saved?: boolean
}
export const ChatOllamaLangchainName = 'ChatOllama' // 节点类型
export const chatOllamaMeta: ChatOllamaData = {
    icon: 'simple-icons:ollama',
    type: ChatOllamaLangchainName,
    title: 'Ollama',
    description: 'Generate text using Ollama Local LLMs.',
    modelNameInputVariable: {
        name: 'Model Name',
        allowedTypes: ['Data'],
        value: 'llama3',
        defaultValue: 'llama3',

    } as InputPortVariable,
    systemMessageInputVariable: {
        name: 'System Instruction',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: 'You are a helpful assistant.',

    } as InputPortVariable,
    baseURLInputVariable: {
        name: 'Request Base URL',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: '',

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
