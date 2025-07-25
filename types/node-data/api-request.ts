import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'
export interface APIRequestData {
    type: string
    title: string
    description: string
    icon?: string
    methodType: string
    urlInputVariable: InputPortVariable
    tokenInputVariable: InputPortVariable
    bodyInputVariable: InputPortVariable
    dataOutputVariable: OutputPortVariable

    show?: boolean
    saved?: boolean
}

export const APIRequestLangchainName = 'APIRequest'

export const apiRequestMeta: APIRequestData = {
    type: APIRequestLangchainName,
    title: 'API Request',
    description: 'Make HTTP requests using URLs or cURL commands.',
    icon: 'hugeicons:api',
    methodType: 'get',
    urlInputVariable: {
        name: 'URL',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    tokenInputVariable: {
        name: 'Token',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    bodyInputVariable: {
        name: 'Body',
        allowedTypes: ['Structured Data', 'Data'],

        value: {
        } as Record<string, any>,
    } as InputPortVariable,
    dataOutputVariable: {
        name: 'When Done',
        outputType: 'Data',
    } as OutputPortVariable,

    show: true,
}
