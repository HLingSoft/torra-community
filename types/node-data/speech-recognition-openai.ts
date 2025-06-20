import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'


export const languages = [
    { id: "en", name: "English (United States/UK)" },
    { id: "zh", name: "Chinese (Simplified, China)" },
    { id: "zh-TW", name: "Chinese (Traditional, Taiwan)" },
    { id: "zh-Hant", name: "Chinese (Traditional, 繁體中文)" },
    { id: "ja", name: "Japanese (Japan)" },
    { id: "ko", name: "Korean (South Korea)" },
    { id: "fr", name: "French (France)" },
    { id: "de", name: "German (Germany)" },
    { id: "ru", name: "Russian (Russia)" },
    { id: "es", name: "Spanish (Spain/Latin America)" },
    { id: "pt", name: "Portuguese (Portugal/Brazil)" },
    { id: "it", name: "Italian (Italy)" },
    { id: "ar", name: "Arabic (Middle East)" },
    { id: "tr", name: "Turkish (Turkey)" },
    { id: "vi", name: "Vietnamese (Vietnam)" },
    { id: "id", name: "Indonesian (Indonesia)" },
    { id: "th", name: "Thai (Thailand)" },
    { id: "pl", name: "Polish (Poland)" },
    { id: "nl", name: "Dutch (Netherlands)" },
    { id: "sv", name: "Swedish (Sweden)" },
    { id: "he", name: "Hebrew (Israel)" }
]

export interface SpeechRecognitionOpenAIData {
    title: string
    type: string
    icon?: string
    description: string
    apiKeyInputVariable: InputPortVariable
    baseURLInputVariable: InputPortVariable
    voiceDataInputVariable: InputPortVariable
    instructionInputVariable: InputPortVariable // 可选的指令输入变量

    languageModelName: string // 可选的语言模型名称

    outputVariable: OutputPortVariable
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    show: boolean
    saved: boolean
}
export const SpeechRecognitionOpenAILangchainName = 'SpeechRecognitionOpenAI'

export const speechRecognitionOpenAIMeta: SpeechRecognitionOpenAIData = {
    title: 'Speech Recognition OpenAI',
    description: 'Automatic Speech Recognition, ASR, using OpenAI models.',
    type: SpeechRecognitionOpenAILangchainName,
    icon: 'material-symbols-light:speech-to-text-rounded',
    languageModelName: 'zh',
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
    voiceDataInputVariable: {
        name: 'Voice Data',
        allowedTypes: ['Data'],
    } as InputPortVariable,


    outputVariable: {
        name: 'When Done',
        outputType: 'Data',
    } as OutputPortVariable,
    toolOutputVariable: {
        name: 'As Tool',
        outputType: 'Tool',
        connected: false,
    } as OutputPortVariable,
    show: true,
    saved: false,
}
