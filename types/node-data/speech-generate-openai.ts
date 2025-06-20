import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'
export const allVoices = {
    alloy: 'alloy',
    ash: 'ash',
    ballad: 'ballad',
    coral: 'coral',
    echo: 'echo',
    fable: 'fable',
    onyx: 'onyx',
    nova: 'nova',
    sage: 'sage',
    shimmer: 'shimmer',
    verse: 'verse',
}
export interface SpeechGenerateOpenAIData {
    title: string
    type: string
    icon?: string
    description: string
    apiKeyInputVariable: InputPortVariable
    baseURLInputVariable: InputPortVariable
    userInputInputVariable: InputPortVariable
    instructionInputVariable: InputPortVariable // 可选的指令输入变量
    modelName: string

    voice: string // 音色



    base64VoiceOutputVariable: OutputPortVariable
    // urlOutputVariable: OutputPortVariable // 可选的URL输出变量
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    show: boolean
    saved: boolean
}
export const SpeechGenerateOpenAILangchainName = 'SpeechRecognitionOpenAI'

export const speechGenerateOpenAIMeta: SpeechGenerateOpenAIData = {
    title: 'Speech Generation OpenAI',
    description: 'Use OpenAI to generate voices based on text instructions. DALLE-3 is recommended for best results.',
    type: SpeechGenerateOpenAILangchainName,
    icon: 'streamline-color:Voice-saturation-flat',
    modelName: 'gpt-4o-mini-tts', // 默认模型名称
    voice: 'coral', // 默认音色
    apiKeyInputVariable: {
        name: 'OpenAI API Key',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,
    baseURLInputVariable: {
        name: 'Request Base URL',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    instructionInputVariable: {
        name: 'Instruction',
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
