import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface URLData {
    title: string
    type: string
    icon?: string
    description: string
    maxDepth?: number
    urlInputVariable: InputPortVariable
    outputVariable: OutputPortVariable


    show: boolean
    saved: boolean
}

export const URLLangchainName = 'URL'

export const urlMeta: URLData = {
    title: 'URL',
    description: 'Load and parse child links from a root URL recursively.',
    type: URLLangchainName,
    icon: 'humbleicons:url',
    maxDepth: 1, // 默认最大深度为1
    urlInputVariable: {
        name: 'Root URL',
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
