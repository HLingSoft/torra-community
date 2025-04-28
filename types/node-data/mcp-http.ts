import type { OutputPortVariable, InputPortVariable } from '~/types/workflow'

export interface MCPHttpData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述

    urlVariable: InputPortVariable // 输入变量
    tokenVariable: InputPortVariable // 匹配类型

    outputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const MCPHttpLangchainName = 'MCPHttp' // 节点类型

export const mcpHttpMeta: MCPHttpData = {
    icon: '💬',
    title: 'MCP Http',
    description: 'Connect to an MCP server and expose tools.',
    type: MCPHttpLangchainName,

    urlVariable: {
        name: 'url',
        allowedTypes: ['Message'],
        value: '',
        forceStringify: true,
    } as InputPortVariable,

    tokenVariable: {

        name: 'token',
        allowedTypes: ['Message'],
        value: '',
        forceStringify: true,
    } as InputPortVariable,


    outputVariable: {
        outputType: 'Tool',
        name: 'output',
    } as OutputPortVariable,

    show: true,
    saved: false,
}
