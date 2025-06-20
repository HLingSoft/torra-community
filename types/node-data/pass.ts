import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface PassData {
    title: string // 节点标题
    type: string // 节点类型
    icon?: string // 节点图标
    description: string // 节点描述
    inputInputVariable: InputPortVariable
    outputVariable: OutputPortVariable
    show: boolean // 控制 UI 展示
    saved: boolean // 是否保存
}
export const PassLangchainName = 'Pass' // 节点类型
export const passMeta: PassData = {
    title: 'Pass',
    description: 'Forwards input to output unchanged; Acts as a placeholder.',
    type: PassLangchainName,
    icon: 'ph:password-duotone',
    inputInputVariable: {
        name: 'Any Input',
        allowedTypes: ['Any'],
        value: '',

    } as InputPortVariable,
    outputVariable: {
        name: 'When Done',
        outputType: 'Any',
    } as OutputPortVariable,
    show: true,
    saved: false,
}
