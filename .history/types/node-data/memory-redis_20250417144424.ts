import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface RedisChatMemoryData {
  type: string
  title: string
  description: string
  icon?: string

  sessionId: string

  urlVariable: InputPortVariable
  tokenVariable: InputPortVariable
  memoryOutputVariable: OutputPortVariable
}

export const RedisChatMemoryLangchainName = 'RedisChatMemory'

export const redisChatMemoryMeta: RedisChatMemoryData = {
  type: RedisChatMemoryLangchainName,
  title: 'Redis Chat Memory',
  icon: '🟥',
  description: 'Retrieves and store chat messages from Redis.',
  sessionId:'',
    urlVariable: {
        name: 'url',
        allowedTypes: ['Message'],
        value: '',
        defaultValue: 'https://fluent-dodo-23157.upstash.io',
    } as InputPortVariable,
    tokenVariable: {
    name: 'token',
    allowedTypes: ['Message'],
    value: '',
    defaultValue: 'AVp1AAIjcDE4YTM3ZjA5NjMzNTc0MDVmODIzZmViZDM3NzMxYTg5MXAxMA',
    } as InputPortVariable,
   
 
  memoryOutputVariable: {
    name: 'memoryOutput',
    outputType: 'Memory',
  } as OutputPortVariable,
}
