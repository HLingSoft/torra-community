import type { OutputPortVariable } from '~/types/workflow'

export interface APIInputData {
    type: string
    title: string
    description: string
    icon?: string

    inputValue: Record<string, any>
    structuredOutputVariable: OutputPortVariable
    extraDataVariable: OutputPortVariable
    show?: boolean
    saved?: boolean
}

export const APIInputLangchainName = 'APIInput'

export const apiInputMeta: APIInputData = {
    type: APIInputLangchainName,
    title: 'API Input',
    description: 'Workflow entry via API, parsing data and triggering AI processes.',
    icon: '🧠',
    inputValue: {
    },
    structuredOutputVariable: {
        name: 'structuredOutput',
        outputType: 'Data',
    } as OutputPortVariable,
    extraDataVariable: {
        name: 'extraData',
        outputType: 'Message',
    } as OutputPortVariable,
    show: true,
}
