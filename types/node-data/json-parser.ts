import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface JSONParserData {
    type: string
    title: string
    description: string
    icon?: string


    inputMessageInputVariable: InputPortVariable
    outputSchemaInputVariable: InputPortVariable
    structuredOutputVariable: OutputPortVariable


    show?: boolean
    saved?: boolean
}

export const JsonParserLangchainName = 'JSONParser'

export const jsonParserMeta: JSONParserData = {
    type: JsonParserLangchainName,
    title: 'JSON Parser',
    description: 'Converts raw text or data into structured JSON format.',
    icon: 'si:json-line',

    inputMessageInputVariable: {
        name: 'Input',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    outputSchemaInputVariable: {
        name: 'Output Schema',
        value: {

        } as Record<string, any>,
    } as InputPortVariable,
    structuredOutputVariable: {
        name: 'When Done',
        outputType: 'Structured Data',
    } as OutputPortVariable,

    show: true,
}
