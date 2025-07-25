import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface DataToMessageData {
    title: string
    type: string
    icon?: string
    description: string
    inputInputVariable: InputPortVariable
    outputVariable: OutputPortVariable
    role: string
    show: boolean
    saved: boolean
}
export const DataToMessageLangchainName = 'DataToMessage'

export const dataToMessageMeta: DataToMessageData = {
    title: 'Data To Message',
    description: 'Convert data content to a LangChain Message',
    type: DataToMessageLangchainName,
    icon: 'fluent:data-usage-toolbox-20-regular',
    role: 'AI',
    inputInputVariable: {
        name: 'Data',
        allowedTypes: ['Data'],
    } as InputPortVariable,
    outputVariable: {
        name: 'When Done',
        outputType: 'Message',
    } as OutputPortVariable,
    show: true,
    saved: false,
}
