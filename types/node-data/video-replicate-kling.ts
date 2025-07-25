

import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'
export const allMode = ['standard', 'pro'] as const

export interface ReplicateKlingVideoData {
    type: string
    title: string
    description: string
    icon?: string
    mode: 'standard' | 'pro'
    aspectRatio: string // 宽高比，例如 "16:9" 或 "1:1"
    duration: number
    authInputVariable: InputPortVariable // Replicate API key input variable
    promptInputport: InputPortVariable
    startImageInputport: InputPortVariable
    negativePromptInputport: InputPortVariable

    base64VideoOutputVariable: OutputPortVariable
    toolOutputVariable: OutputPortVariable // Optional tool output variable
    show?: boolean
    saved?: boolean
}

export const ReplicateKlingVideoLangchainName = 'ReplicateKlingVideo'

export const replicateKlingVideoMeta: ReplicateKlingVideoData = {
    type: ReplicateKlingVideoLangchainName,
    title: 'Kling Video',
    description: `Generate video from image using the Kling model on Replicate.`,
    icon: 'si:video-duotone',
    mode: 'standard',
    duration: 5,
    aspectRatio: '9:16', // 默认宽高比
    authInputVariable: {
        name: 'Replicate API Key',
        allowedTypes: ['Data'],
        value: '',
        connected: false,
        defaultValue: '',
    } as InputPortVariable,
    promptInputport: {
        name: 'Prompt',
        allowedTypes: ['Data'],
        connected: false,
        value: '',
    } as InputPortVariable,
    startImageInputport: {
        name: 'Start Image',
        connected: false,
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,
    negativePromptInputport: {
        name: 'Negative Prompt',
        connected: false,
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,
    // urlOutport: {
    //     name: 'Output Video',
    //     outputType: 'Data',

    // } as OutputPortVariable,
    base64VideoOutputVariable: {
        name: 'Return Base64 Video',
        outputType: 'Base64',
    } as OutputPortVariable,
    toolOutputVariable: {
        name: 'As Tool',
        outputType: 'Tool',

    } as OutputPortVariable,


    show: true,
}
