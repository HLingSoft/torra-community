import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface APIRequestData {
    type: string
    title: string
    description: string
    icon?: string
    methodType: string
    urlInputVariable?: InputPortVariable
    body:Record<string, any>
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
    methodType: 'GET',
    urlInputVariable: {
        name: 'urlInput',
        allowedTypes: ['Message'],
        value: '',
    } as InputPortVariable,
    body: {},
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
