import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface AgentData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述
    modelProvider: string // 模型提供者
    modelName: string // 模型名称
    apiKeyVariable: InputPortVariable // API 变量
    baseURLVariable: InputPortVariable // 基础 URL 变量

    instructionVariable: InputPortVariable // 指令变量
    inputVariable: InputPortVariable // 输入变量
    toolsVariable: InputPortVariable // 工具变量
    outputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const AgentLangchainName = 'Agent' // 节点类型

export const agentMeta: AgentData = {
    icon: '💬',
    title: 'Agent',
    description: `Define the agent's instructions, then enter a task to complete using tools`,
    type: AgentLangchainName,
    modelProvider: 'OpenAI',
    modelName: 'gpt-4o-mini',
    apiKeyVariable: {
        name: 'apiKeyInput',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'sk-sXW78QiqIJCIc48ueZwg3fIlYmb2PWye22yL13mYOdPxdSiU',
        forceStringify: true,
    } as InputPortVariable,
    instructionVariable: {
        name: 'instructionInput',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'You are a helpful assistant that can use tools to answer questions and perform tasks.',
        forceStringify: true,
    } as InputPortVariable,
    inputVariable: {
        name: 'inputInput',
        allowedTypes: ['Message'],
        value: '',
        forceStringify: true,
    } as InputPortVariable,
    toolsVariable: {
        name: 'toolsInput',
        allowedTypes: ['Tool'],
        forceStringify: false,
    } as InputPortVariable,
    baseURLVariable: {
        name: 'baseURLInput',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'https://api.openai-proxy.org/v1',
        forceStringify: true,
    } as InputPortVariable,
    outputVariable: {
        outputType: 'Message',
        name: 'output',
    } as OutputPortVariable,
    show: true,
}
