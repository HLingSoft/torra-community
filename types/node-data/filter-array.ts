import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface FilterArray {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述
    inputInputVariable: InputPortVariable // 输入变量
    filterKeyInputVariable: InputPortVariable // 过滤条件
    outputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const FilterArrayLangchainName = 'FilterArray' // 节点类型

export const filterArrayMeta: FilterArray = {
    icon: 'solar:filter-bold-duotone',
    title: 'Filter Array',
    description: 'Pick out the value for a specific key in the array of data.',
    type: FilterArrayLangchainName,
    filterKeyInputVariable: {
        name: 'Filter Key',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,

    inputInputVariable: {
        name: 'Structured Data',
        allowedTypes: ['Structured Data'],
        value: '',

    } as InputPortVariable,
    outputVariable: {
        outputType: 'Data[]',
        name: 'When Done',
    } as OutputPortVariable,
    show: true,
}
