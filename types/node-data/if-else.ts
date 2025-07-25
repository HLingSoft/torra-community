import type { OutputPortVariable, InputPortVariable } from '~~/types/workflow'

export enum MatchType {
    String = 'String',
    Boolean = 'Boolean'
}

export interface IfElseData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述
    textInputVariable: InputPortVariable // 输入变量
    matchType: string // 匹配类型
    matchTextInputVariable: InputPortVariable // 匹配文本变量
    operator: string // 操作符
    caseSensitive: boolean // 是否区分大小写
    messageInputVariable: InputPortVariable // 消息变量
    trueOutputVariable: OutputPortVariable
    falseOutputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const IfElseDataLangchainName = 'IfElse' // 节点类型

export const ifElseMeta: IfElseData = {
    icon: 'tabler:logic-buffer',
    title: 'If-Else',
    description: 'Routes an input message to a corresponding output based on text comparison.',
    type: IfElseDataLangchainName,

    textInputVariable: {

        name: 'Input',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    matchType: MatchType.String,
    matchTextInputVariable: {
        name: 'Match Text',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    operator: 'equals',
    messageInputVariable: {
        name: 'Data',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: '',

    } as InputPortVariable,
    trueOutputVariable: {
        outputType: 'Data',
        name: 'If True ',

    } as OutputPortVariable,
    falseOutputVariable: {
        outputType: 'Data',
        name: 'If False  ',
    } as OutputPortVariable,
    caseSensitive: false,
    show: true,
    saved: false,
}
