import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'
export interface KeyValueRow {
    id: number
    key: string
    value: string // default value
    selected: boolean
    description: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
}
export interface APIToolData {
    type: string
    title: string
    description: string
    icon?: string
    methodType: string
    toolNameInputVariable: InputPortVariable
    toolDescriptionInputVariable: InputPortVariable
    urlInputVariable: InputPortVariable
    tokenInputVariable: InputPortVariable
    bodyInputVariable: InputPortVariable
    toolOutputVariable: OutputPortVariable
    show?: boolean
    saved?: boolean
}

export const APIToolLangchainName = 'APITool'

export const apiToolMeta: APIToolData = {
    type: APIToolLangchainName,
    title: 'API Tool',
    description: 'Make authorized HTTP requests (GET, POST) to a given API endpoint.',//让 http 请求变成 Agent 的 Tool
    icon: 'logos:async-api-icon',
    methodType: 'get',
    toolNameInputVariable: {
        name: 'Tool Name',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: 'http_request_tool',

    } as InputPortVariable,

    toolDescriptionInputVariable: {
        name: 'Tool Description',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: 'Make authorized HTTP requests (GET, POST) to a given API endpoint.',

    } as InputPortVariable,

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
        allowedTypes: ['Data'],

        value: [] as KeyValueRow[],
    } as InputPortVariable,

    toolOutputVariable: {
        name: 'When Done',
        outputType: 'Tool',
    } as OutputPortVariable,
    show: true,
}
