import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface ImageGenerateOpenAIData {
    title: string
    type: string
    icon?: string
    description: string
    apiKeyInputVariable: InputPortVariable
    baseURLInputVariable: InputPortVariable
    userInputInputVariable: InputPortVariable
    size: "1024x1024" | "1792x1024" | "1024x1792"
    style: "natural" | "vivid"
    quality: "standard" | "hd"




    base64ImageOutputVariable: OutputPortVariable
    // urlOutputVariable: OutputPortVariable // 可选的URL输出变量
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    show: boolean
    saved: boolean
}
export const ImageGenerateOpenAILangchainName = 'ImageGenerateOpenAI'

export const imageGenerateOpenAIMeta: ImageGenerateOpenAIData = {
    title: 'Image Generation OpenAI',
    description: 'Use OpenAI to generate images based on text instructions. DALLE-3 is recommended for best results.',
    type: ImageGenerateOpenAILangchainName,
    icon: 'streamline-color:image-saturation-flat',
    size: '1024x1024', // 默认图像尺寸
    style: 'natural', // 默认图像风格
    quality: 'standard', // 默认图像质量
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


    userInputInputVariable: {
        name: 'User Input',
        allowedTypes: ['Data'],
    } as InputPortVariable,
    base64ImageOutputVariable: {
        name: 'Return Base64 Image',
        outputType: 'Base64',
    } as OutputPortVariable,
    // urlOutputVariable: {
    //     name: 'Return Image URL',
    //     outputType: 'Data',
    // } as OutputPortVariable,
    toolOutputVariable: {
        name: 'As Tool',
        outputType: 'Tool',
        connected: false,
    } as OutputPortVariable,
    show: true,
    saved: false,
}
