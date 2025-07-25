import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface StructuredOutputData {
    type: string
    title: string
    description: string
    icon?: string

    languageModelInputVariable: InputPortVariable

    outputSchemaInputVariable: InputPortVariable
    structuredOutputVariable: OutputPortVariable



    show?: boolean
    saved?: boolean
}

export const StructuredOutputLangchainName = 'StructuredOutput'

export const structuredOutputMeta: StructuredOutputData = {
    type: StructuredOutputLangchainName,
    title: 'Structured Output',
    description: 'Transforms LLM responses into **structured data formats**. Ideal for extracting specific information or creating consistent outputs.',
    icon: 'streamline-plump-color:industry-innovation-and-infrastructure-flat',
    languageModelInputVariable: {
        name: 'Language Model',
        allowedTypes: ['LanguageModel'],

    } as InputPortVariable,

    outputSchemaInputVariable: {
        name: 'OutputSchema',
        value: {

        } as Record<string, any>,
    } as InputPortVariable,
    structuredOutputVariable: {
        name: 'When Done',
        outputType: 'Structured Data',
    } as OutputPortVariable,

    show: true,
}
