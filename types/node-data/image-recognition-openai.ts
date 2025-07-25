import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ImageRecognitionOpenAIData {
    title: string
    type: string
    icon?: string
    description: string
    apiKeyInputVariable: InputPortVariable
    baseURLInputVariable: InputPortVariable
    imageDataInputVariable: InputPortVariable
    instructionInputVariable: InputPortVariable
    outputVariable: OutputPortVariable
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    show: boolean
    saved: boolean
}
export const ImageRecognitionOpenAILangchainName = 'ImageRecognitionOpenAI'

export const imageRecognitionOpenAIMeta: ImageRecognitionOpenAIData = {
    title: 'Image Recognition OpenAI',
    description: 'Use OpenAI to recognize images and generate text descriptions.',
    type: ImageRecognitionOpenAILangchainName,
    icon: 'streamline-color:image-saturation-flat',

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
    imageDataInputVariable: {
        name: 'Image Data',
        allowedTypes: ['Data'],
    } as InputPortVariable,

    instructionInputVariable: {
        name: 'Instruction',
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
