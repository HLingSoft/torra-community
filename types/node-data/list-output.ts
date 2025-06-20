

import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'


export interface ListOutputData {
    type: string
    title: string
    description: string
    icon?: string

    languageModelInputVariable: InputPortVariable
    inputMessageVariable: InputPortVariable
    outputSchemaInputVariable: InputPortVariable
    listOutputVariable: OutputPortVariable



    show?: boolean
    saved?: boolean
}

export const ListOutputLangchainName = 'ListOutput'

export const listOutputMeta: ListOutputData = {
    type: ListOutputLangchainName,
    title: 'List Output',
    description: `Transforms LLM responses into structured list (array) formats. Ideal for extracting multiple items, batch information, or generating consistent array outputs from unstructured text.`,
    icon: 'solar:list-line-duotone',
    languageModelInputVariable: {
        name: 'Language Model',
        allowedTypes: ['LanguageModel'],

    } as InputPortVariable,
    inputMessageVariable: {
        name: 'Input Message',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    outputSchemaInputVariable: {
        name: 'Item Schema',
        value: {

        } as Record<string, any>,
    } as InputPortVariable,
    listOutputVariable: {
        name: 'Return List Data',
        outputType: 'Data[]',
    } as OutputPortVariable,

    show: true,
}
