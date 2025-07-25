import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'
export interface KeyValueRow {
    id: number
    key: string
    value: string // default value
    selected: boolean
    description: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    /** 新增：跟踪 InputPortVariable.id */
    varId?: string;
}
export interface SubWorkflowData {
    type: string
    title: string
    description: string
    icon?: string


    urlInputVariable: InputPortVariable
    tokenInputVariable: InputPortVariable
    userIdInputVariable: InputPortVariable // 新增：用户ID输入变量
    bodyKeyValueRows?: KeyValueRow[]
    bodyInputVariable: InputPortVariable[]
    dataOutputVariable: OutputPortVariable
    show?: boolean
    saved?: boolean
}

export const SubWorkflowLangchainName = 'SubWorkflow'

export const subWorkflowMeta: SubWorkflowData = {
    type: SubWorkflowLangchainName,
    title: 'Sub Workflow',
    description: 'Execute a sub-workflow',
    icon: 'catppuccin:folder-workflows-open',
    urlInputVariable: {
        name: 'URL of Sub-Workflow',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    tokenInputVariable: {
        name: 'Token',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    userIdInputVariable: {
        name: 'Torra-User-Id',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,

    bodyInputVariable: [
    ] as InputPortVariable[],
    dataOutputVariable: {
        name: 'When Done',
        outputType: 'Data',
    } as OutputPortVariable,

    show: true,
}
