import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface VoiceItem {
    id: string
    name: string
}

export interface SpeechGenerateEleventlabsData {
    title: string
    type: string
    icon?: string
    description: string
    apiKeyInputVariable: InputPortVariable
    userInputInputVariable: InputPortVariable



    voice: string // 音色
    speed: number // 可选的语速


    base64VoiceOutputVariable: OutputPortVariable
    // urlOutputVariable: OutputPortVariable // 可选的URL输出变量
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    show: boolean
    saved: boolean
}
export const SpeechGenerateEleventlabsLangchainName = 'SpeechRecognitionEleventlabs'

export const speechGenerateEleventlabsMeta: SpeechGenerateEleventlabsData = {
    title: 'Speech Generation Eleventlabs',
    description: 'Generate speech using Eleventlabs TTS service',
    type: SpeechGenerateEleventlabsLangchainName,
    icon: 'streamline-color:Voice-saturation-flat',

    voice: '', // 默认音色
    speed: 1, // 默认语速
    apiKeyInputVariable: {
        name: 'Eleventlabs API Key',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,



    userInputInputVariable: {
        name: 'User Input',
        allowedTypes: ['Data'],
    } as InputPortVariable,
    base64VoiceOutputVariable: {
        name: 'Return Base64 Voice',
        outputType: 'Base64',
    } as OutputPortVariable,

    toolOutputVariable: {
        name: 'As Tool',
        outputType: 'Tool',
        connected: false,
    } as OutputPortVariable,
    show: true,
    saved: false,
}
