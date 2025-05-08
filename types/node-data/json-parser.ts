import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface JSONParserData {
    type: string
    title: string
    description: string
    icon?: string


    inputMessageVariable: InputPortVariable
    outputSchema: InputPortVariable
    structuredOutputVariable: OutputPortVariable


    show?: boolean
    saved?: boolean
}

export const JsonParserLangchainName = 'JSONParser'

export const jsonParserMeta: JSONParserData = {
    type: JsonParserLangchainName,
    title: 'JSON Parser',
    description: 'Format a DataFrame or Data object into text using a template.',
    icon: '🧠',

    inputMessageVariable: {
        name: 'inputMessage',
        allowedTypes: ['Message'],
        value: '',
        forceStringify: true,
    } as InputPortVariable,
    outputSchema: {
        name: 'outputSchema',
        value: {

        } as Record<string, any>,
    } as InputPortVariable,
    structuredOutputVariable: {
        name: 'dataOutput',
        outputType: 'Data',
    } as OutputPortVariable,

    show: true,
}
