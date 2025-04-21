import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface RedisChatMemoryData {
  type: string
  title: string
  description: string
  icon?: string

  hostnameVariable: InputPortVariable
  portVariable: InputPortVariable
  databaseVariable: InputPortVariable
  sessionIdVariable: InputPortVariable

  memoryOutputVariable: OutputPortVariable
}

export const RedisChatMemoryLangchainName = 'RedisChatMemory'

export const redisChatMemoryMeta: RedisChatMemoryData = {
  type: RedisChatMemoryLangchainName,
  title: 'Redis Chat Memory',
  icon: '🟥',
  description: 'Retrieves and store chat messages from Redis.',

  hostnameVariable: {
    name: 'hostname',
    allowedTypes: ['Message'],
    value: 'localhost',
    defaultValue: 'localhost',
  },
  portVariable: {
    name: 'port',
    allowedTypes: ['Message'],
    value: '6379',
    defaultValue: '6379',
  },
  databaseVariable: {
    name: 'database',
    allowedTypes: ['Message'],
    value: '0',
    defaultValue: '0',
  },
  sessionIdVariable: {
    name: 'sessionId',
    allowedTypes: ['Message'],
    value: '',
    defaultValue: 'default-session',
  },
  memoryOutputVariable: {
    name: 'memoryOutput',
    outputType: 'Memory',
  },
}
