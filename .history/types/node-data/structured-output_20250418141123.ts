import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface StructuredOutputData {
    type: string
    title: string
    description: string
    icon?: string
    
    languageModelVariable: InputPortVariable
    inputMessageVariable?: InputPortVariable
    bodyVariable: InputPortVariable
    dataOutputVariable: OutputPortVariable
    dataFrameOutputVariable: OutputPortVariable
    show?: boolean
    saved?: boolean
}

export const StructuredOutputLangchainName = 'StructuredOutput'

export const structuredOutputMeta: StructuredOutputData = {
    type: StructuredOutputLangchainName,
    title: 'Structured Output',
    description: 'Transforms LLM responses into **structured data formats**. Ideal for extracting specific information or creating consistent outputs.',
    icon: '🧠',
    languageModelVariable: {
        name: 'languageModel',
        allowedTypes: ['LanguageModel'],
        value: '',
    } as InputPortVariable,
    bodyVariable: {
        name: 'body',
        allowedTypes: ['Data'],
        value: {
        } as Record<string, any>,
    } as InputPortVariable,
    dataOutputVariable: {
        name: 'dataOutput',
        outputType: 'Data',
    } as OutputPortVariable,
    dataFrameOutputVariable: {
        name: 'dataFrameOutput',
        outputType: 'DataFrame',
    } as OutputPortVariable,
    show: true,
}
