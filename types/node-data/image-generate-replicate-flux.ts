

import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'
export const allMode = ['standard', 'pro'] as const

export interface ReplicateFluxData {
    type: string
    title: string
    description: string
    icon?: string
    width: number // 图片宽度
    height: number // 图片高度
    aspectRatio: string // 宽高比，例如 "16:9" 或 "1:1"
    imagePromptInputPortVariable: InputPortVariable // Image to use with Flux Redux. This is used together with the text prompt to guide the generation towards the composition of the image_prompt. Must be jpeg, png, gif, or webp.
    authInputVariable: InputPortVariable // Replicate API key input variable
    promptInputport: InputPortVariable


    base64ImageOutputVariable: OutputPortVariable
    toolOutputVariable: OutputPortVariable // Optional tool output variable
    show?: boolean
    saved?: boolean
}

export const ReplicateFluxLangchainName = 'ReplicateFlux'

export const replicateFluxMeta: ReplicateFluxData = {
    type: ReplicateFluxLangchainName,
    title: 'Flux Image',
    description: `Generate image using the Flux model on Replicate.`,
    icon: 'si:video-duotone',
    width: 1024, // 默认宽度
    height: 1024, // 默认高度
    aspectRatio: '1:1', // 默认宽高比
    imagePromptInputPortVariable: {
        name: 'Image Prompt',
        allowedTypes: ['Data'],
        connected: false,
        value: '',
    } as InputPortVariable,
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
    base64ImageOutputVariable: {
        name: 'Return Base64 Image',
        outputType: 'Base64',
    } as OutputPortVariable,
    toolOutputVariable: {
        name: 'As Tool',
        outputType: 'Tool',

    } as OutputPortVariable,


    show: true,
}
