import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface UpstashRedisChatMemoryData {
    type: string
    title: string
    description: string
    icon?: string

    sessionIdInputVariable: InputPortVariable

    urlInputVariable: InputPortVariable
    tokenInputVariable: InputPortVariable
    memoryOutputVariable: OutputPortVariable
}

// export const UpstashRedisChatMemoryLangchainName = 'UpstashRedisChatMemoryLangchainName'
export const UpstashRedisChatMemoryLangchainName = 'UpstashRedisChatMemory'
export const upstashRedisChatMemoryMeta: UpstashRedisChatMemoryData = {
    type: UpstashRedisChatMemoryLangchainName,
    title: 'Upstash Redis Chat Memory',
    icon: 'logos:upstash-icon',
    description: 'Retrieves and store chat messages from Upstash Redis.',
    sessionIdInputVariable: {
        name: 'Session ID',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,

    urlInputVariable: {
        name: 'Upstash Redis URL',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: 'https://fluent-dodo-23157.upstash.io',

    } as InputPortVariable,
    tokenInputVariable: {
        name: 'Upstash Redis Token',
        allowedTypes: ['Data'],
        value: '',
        defaultValue: 'AVp1AAIjcDE4YTM3ZjA5NjMzNTc0MDVmODIzZmViZDM3NzMxYTg5MXAxMA',

    } as InputPortVariable,


    memoryOutputVariable: {
        name: 'Return Memory',
        outputType: 'Memory',
    } as OutputPortVariable,
}
