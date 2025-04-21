import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface UpstashRedisChatMemoryData {
    type: string
    title: string
    description: string
    icon?: string

    sessionId: string

    urlVariable: InputPortVariable
    tokenVariable: InputPortVariable
    memoryOutputVariable: OutputPortVariable
}

// export const UpstashRedisChatMemoryLangchainName = 'UpstashRedisChatMemoryLangchainName'
export const UpstashRedisChatMemoryLangchainName = 'UpstashRedisChatMemory'
export const upstashRedisChatMemoryMeta: UpstashRedisChatMemoryData = {
    type: UpstashRedisChatMemoryLangchainName,
    title: 'Upstash Redis Chat Memory',
    icon: '🟥',
    description: 'Retrieves and store chat messages from Upstash Redis.',
    sessionId: '',
    urlVariable: {
        name: 'url',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'https://fluent-dodo-23157.upstash.io',
        forceStringify: true,
    } as InputPortVariable,
    tokenVariable: {
        name: 'token',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'AVp1AAIjcDE4YTM3ZjA5NjMzNTc0MDVmODIzZmViZDM3NzMxYTg5MXAxMA',
        forceStringify: true,
    } as InputPortVariable,


    memoryOutputVariable: {
        name: 'memoryOutput',
        outputType: 'Memory',
    } as OutputPortVariable,
}
