import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface StructuredToDataData {
    type: string
    title: string
    description: string
    icon?: string

    structuredDataInputVariable: InputPortVariable // 可选的结构化数据输入变量


    outputVariable: OutputPortVariable // 输出变量，表示转换后的数据



    show?: boolean
    saved?: boolean
}

export const StructuredToDataLangchainName = 'StructuredToData'

export const structuredToDataMeta: StructuredToDataData = {
    type: StructuredToDataLangchainName,
    title: 'Structured Data to Data',
    description: 'Transforms structured data into a simple data format. Useful for converting structured outputs into more flexible formats.',
    icon: 'gg:arrows-exchange-alt',
    structuredDataInputVariable: {
        name: 'Structured Data',
        allowedTypes: ['Structured Data'],

    } as InputPortVariable,


    outputVariable: {
        name: 'When Done',
        outputType: 'Data',
    } as OutputPortVariable,

    show: true,
}
