import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface AgentData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述
    modelProvider: string // 模型提供者
    modelName: string // 模型名称
    apiKeyInputVariable: InputPortVariable // API 变量
    baseURLInputVariable: InputPortVariable // 基础 URL 变量
    historyMessageInputVariable: InputPortVariable
    instructionInputVariable: InputPortVariable // 指令变量
    inputInputVariable: InputPortVariable // 输入变量
    toolsInputVariable: InputPortVariable // 工具变量
    outputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const AgentLangchainName = 'Agent' // 节点类型

export const agentMeta: AgentData = {
    icon: 'fluent:bot-48-regular',
    title: 'Agent',
    description: `Define the agent's instructions, then enter a task to complete using tools`,
    type: AgentLangchainName,
    modelProvider: 'OpenAI',
    modelName: 'o3',
    apiKeyInputVariable: {
        name: 'OpenAI API Key',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: '',

    } as InputPortVariable,
    instructionInputVariable: {
        name: 'Agent Instruction',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: 'You are a helpful assistant that can use tools to answer questions and perform tasks.',

    } as InputPortVariable,
    inputInputVariable: {
        name: 'Input',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    historyMessageInputVariable: {
        name: 'History Message',
        allowedTypes: ['Message[]'],

    } as InputPortVariable,
    toolsInputVariable: {
        name: 'Tools',
        allowedTypes: ['Tools', 'Tool'],

    } as InputPortVariable,
    baseURLInputVariable: {
        name: 'Request Base URL',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: '',

    } as InputPortVariable,
    outputVariable: {
        outputType: 'Data',
        name: 'When Done',
    } as OutputPortVariable,
    show: true,
}
