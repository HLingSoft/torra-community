import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface VoiceItem {
    id: string
    name: string
}

export interface SpeechGenerateMinimaxData {
    title: string
    type: string
    icon?: string
    description: string
    authInputVariable: InputPortVariable // Replicate API token input variable
    userInputInputVariable: InputPortVariable

    /**
     * Replicate minimax parameters
     */
    voiceId: string // 音色 ID，对应 minimax 的 voice_id
    speed: number // 语速，范围建议 0.5–2.0
    volume: number // 音量，范围 0–1
    emotion: string // 情绪，例如 happy / sad / angry / neutral

    base64VoiceOutputVariable: OutputPortVariable
    // urlOutputVariable: OutputPortVariable // 可选的 URL 输出变量
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    show: boolean
    saved: boolean
}

export const SpeechGenerateMinimaxLangchainName = 'SpeechGenerationMinimax'

export const speechGenerateMinimaxMeta: SpeechGenerateMinimaxData = {
    title: 'Speech Generation Minimax (Replicate)',
    description: 'Generate speech using Replicate\'s Minimax TTS model',
    type: SpeechGenerateMinimaxLangchainName,
    icon: 'streamline-color:Voice-saturation-flat',

    voiceId: 'Friendly_Person', // 默认音色
    speed: 0.8, // 默认语速
    volume: 1, // 默认音量
    emotion: 'happy', // 默认情绪

    authInputVariable: {
        name: 'Replicate API Token',
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
