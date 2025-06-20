import type { OutputPortVariable, InputPortVariable } from '~/types/workflow'

export interface MCPHttpData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述

    urlInputVariable: InputPortVariable // 输入变量
    tokenInputVariable: InputPortVariable // 匹配类型

    outputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const MCPHttpLangchainName = 'MCPHttp' // 节点类型

export const mcpHttpMeta: MCPHttpData = {
    icon: 'solar:server-2-broken',
    title: 'MCP Http',
    description: 'Connect to an MCP server and expose tools.',
    type: MCPHttpLangchainName,

    urlInputVariable: {
        name: 'MCP URL',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,

    tokenInputVariable: {

        name: 'Authorization Token',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,


    outputVariable: {
        outputType: 'Tools',
        name: 'When Done',
    } as OutputPortVariable,

    show: true,
    saved: false,
}
