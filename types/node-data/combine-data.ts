import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface CombineDataData {
    title: string
    type: string
    icon?: string
    description: string
    operationType: string
    dataInputsInputVariable: InputPortVariable
    outputVariable: OutputPortVariable

    show: boolean
    saved: boolean
}
export const CombineDataLangchainName = 'CombineData'

export const combineDataMeta: CombineDataData = {
    title: 'Combine Data',
    description: 'Combines data using different operations',
    type: CombineDataLangchainName,
    icon: 'fluent:data-usage-toolbox-20-regular',
    operationType: 'merge', // 默认操作类型为合并
    dataInputsInputVariable: {
        name: 'Data Inputs',
        allowedTypes: ['Data', 'Data[]'],
    } as InputPortVariable,
    outputVariable: {
        name: 'When Done',
        outputType: 'Data',
    } as OutputPortVariable,
    show: true,
    saved: false,
}
