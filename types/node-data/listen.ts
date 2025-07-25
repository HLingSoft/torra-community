import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface ListenData {
    title: string // 节点标题
    type: string // 节点类型
    icon?: string // 节点图标
    description: string // 节点描述
    nameInputVariable: InputPortVariable
    outputVariable: OutputPortVariable
    show: boolean // 控制 UI 展示
    saved: boolean // 是否保存
}
export const ListenLangchainName = 'Listen' // 节点类型
export const listenMeta: ListenData = {
    title: 'Listen',
    description: 'A component to listen for a notification.',
    type: ListenLangchainName,
    icon: 'mage:broadcast',
    nameInputVariable: {
        name: 'Name',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    outputVariable: {
        name: 'When Done',
        outputType: 'Data',
    } as OutputPortVariable,
    show: true,
    saved: false,
}
