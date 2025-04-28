import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface APIToolData {
    type: string
    title: string
    description: string
    icon?: string
    methodType: string
    toolNameVariable: InputPortVariable
    toolDescriptionVariable: InputPortVariable
    urlInputVariable: InputPortVariable
    tokenVariable: InputPortVariable
    bodyVariable: InputPortVariable
    toolOutputVariable: OutputPortVariable
    show?: boolean
    saved?: boolean
}

export const APIToolLangchainName = 'APITool'

export const apiToolMeta: APIToolData = {
    type: APIToolLangchainName,
    title: 'API Tool',
    description: 'Make authorized HTTP requests (GET, POST) to a given API endpoint.',//让 http 请求变成 Agent 的 Tool
    icon: '🧠',
    methodType: 'get',
    toolNameVariable: {
        name: 'toolName',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'http_request_tool',
        forceStringify: true,
    } as InputPortVariable,

    toolDescriptionVariable: {
        name: 'toolDescription',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'Make authorized HTTP requests (GET, POST) to a given API endpoint.',
        forceStringify: true,
    } as InputPortVariable,

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

    toolOutputVariable: {
        name: 'toolOutput',
        outputType: 'Tool',
    } as OutputPortVariable,
    show: true,
}
