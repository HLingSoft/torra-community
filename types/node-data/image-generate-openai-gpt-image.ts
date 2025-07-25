import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ImageGenerateOpenAIGptImageData {
    title: string
    type: string
    icon?: string
    description: string
    compression: number
    count: number  // n: 1–10
    background: 'transparent' | 'opaque' | 'auto'  // 默认 auto
    moderation: 'low' | 'auto'  // 默认 auto
    format: 'png' | 'jpeg' | 'webp'  // 默认 png
    quality: 'low' | 'medium' | 'high' | 'auto'  // 默认 auto
    size: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'  // 默认 auto

    apiKeyInputVariable: InputPortVariable
    baseURLInputVariable: InputPortVariable
    promptInputVariable: InputPortVariable

    base64ImageOutputVariable: OutputPortVariable
    singlebase64ImageOutputVariable: OutputPortVariable
    toolOutputVariable: OutputPortVariable
    show: boolean
    saved: boolean
}

export const ImageGenerateOpenAIGptImageLangchainName = 'ImageGenerateOpenAIGptImage'

export const imageGenerateOpenAIGptImageMeta: ImageGenerateOpenAIGptImageData = {
    title: 'OpenAI GPT-Image-1',
    description: 'Use OpenAI’s gpt-image-1 endpoint to generate or edit images with photorealistic quality.',
    type: ImageGenerateOpenAIGptImageLangchainName,
    icon: 'streamline-color:image-saturation-flat',
    compression: 0,  // 默认压缩级别
    count: 1,  // 默认生成一张图片
    background: 'auto',  // 默认 auto
    moderation: 'auto',  // 默认 auto
    format: 'webp',  // 默认 png
    quality: 'auto',  // 默认 auto
    size: 'auto',  // 默认 auto
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

    promptInputVariable: {
        name: 'Prompt',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,

    base64ImageOutputVariable: {
        name: 'Return Base64 Images',
        outputType: 'Base64[]',
    } as OutputPortVariable,
    singlebase64ImageOutputVariable: {
        name: 'Return Base64 Image',
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
