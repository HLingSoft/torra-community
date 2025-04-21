import type { OutputPortVariable, InputPortVariable } from '~/types/workflow'

export interface IfElseData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述
    textInputVariable: InputPortVariable // 输入变量
    matchTextVariable: InputPortVariable // 匹配文本变量
    operator: string // 操作符
    caseSensitive: boolean // 是否区分大小写
    messageVariable: InputPortVariable // 消息变量
    trueOutputVariable: OutputPortVariable
    falseOutputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const IfElseDataLangchainName = 'IfElseData' // 节点类型

export const ifElseMeta: IfElseData = {
    icon: '💬',
    title: 'If-Else',
    description: 'Routes an input message to a corresponding output based on text comparison.',
    type: IfElseDataLangchainName,
    textInputVariable: {

        name: 'textInput',
        allowedTypes: ['Message'],
        value: '',
    } as InputPortVariable,
    matchTextVariable: {
        name: 'matchText',
        allowedTypes: ['Message'],
        value: '',
    } as InputPortVariable,
    operator: 'equals',
    messageVariable: {
        name: 'message',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: '',
    } as InputPortVariable,
    trueOutputVariable: {
        outputType: 'Message',
        name: 'output-true',
        value: true
    } as OutputPortVariable,
    falseOutputVariable: {
        outputType: 'Message',
        name: 'output-false',
 
    } as OutputPortVariable,
    caseSensitive: false,
    show: true,
    saved: false,
}
