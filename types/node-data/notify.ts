import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface NotifyData {
    title: string // 节点标题
    type: string // 节点类型
    icon?: string // 节点图标
    description: string // 节点描述
    isAppend: boolean // 是否追加数据
    dataInputVariable: InputPortVariable // 可选的数据输入变量
    notifyNameInputVariable: InputPortVariable
    outputVariable: OutputPortVariable
    show: boolean // 控制 UI 展示
    saved: boolean // 是否保存
}
export const NotifyLangchainName = 'Notify' // 节点类型
export const notifyMeta: NotifyData = {
    title: 'Notify',
    description: 'A component to generate a notification to Get Notified component (Listen..).',
    type: NotifyLangchainName,
    icon: 'mage:broadcast',
    isAppend: false, // 默认不追加数据
    dataInputVariable: {
        name: 'Data Input',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,
    notifyNameInputVariable: {
        name: 'Notify Name',
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
