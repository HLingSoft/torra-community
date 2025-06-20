import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface DataToStructuredData {
    type: string
    title: string
    description: string
    icon?: string

    dataInputVariable: InputPortVariable // 可选的结构化数据输入变量


    structuredDataOutputVariable: OutputPortVariable // 输出变量，表示转换后的数据



    show?: boolean
    saved?: boolean
}

export const DataToStructuredLangchainName = 'DataToStructured'

export const dataToStructuredMeta: DataToStructuredData = {
    type: DataToStructuredLangchainName,
    title: 'Data to Structured Data',
    description: 'Transforms simple data into structured data format. Useful for converting flexible inputs into structured outputs.',
    icon: 'humbleicons:exchange-horizontal',
    dataInputVariable: {
        name: 'Data',
        allowedTypes: ['Data'],

    } as InputPortVariable,

    structuredDataOutputVariable: {
        name: 'When Done',
        outputType: 'Structured Data',
    } as OutputPortVariable,

    show: true,
}
