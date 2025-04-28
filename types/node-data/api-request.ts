import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface APIRequestData {
    type: string
    title: string
    description: string
    icon?: string
    methodType: string
    urlInputVariable: InputPortVariable
    tokenVariable: InputPortVariable
    bodyVariable: InputPortVariable
    dataOutputVariable: OutputPortVariable
    dataFrameOutputVariable: OutputPortVariable
    show?: boolean
    saved?: boolean
}

export const APIRequestLangchainName = 'APIRequest'

export const apiRequestMeta: APIRequestData = {
    type: APIRequestLangchainName,
    title: 'API Request',
    description: 'Make HTTP requests using URLs or cURL commands.',
    icon: '🧠',
    methodType: 'get',
    urlInputVariable: {
        name: 'urlInput',
        allowedTypes: ['Message'],
        value: '',
        forceStringify: true,
    } as InputPortVariable,
    tokenVariable: {
        name: 'tokenInput',
        allowedTypes: ['Message'],
        value: '',
        forceStringify: true,
    } as InputPortVariable,
    bodyVariable: {
        name: 'body',
        allowedTypes: ['Data'],
        forceStringify: true,
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
