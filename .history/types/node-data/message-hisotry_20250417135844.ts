import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageHistoryData {
  type: string
  title: string
  description: string
  icon?: string

  memoryInputVariable: InputPortVariable

  dataOutputVariable: OutputPortVariable
  messageOutputVariable: OutputPortVariable
  dataframeOutputVariable: OutputPortVariable
}
export const MessageHistoryLangchainName = 'MessageHistory'

export const messageHistoryMeta: MessageHistoryData = {
  type: MessageHistoryLangchainName,
  title: 'Message History',
  icon: '💬',
  description: 'Retrieves stored chat messages from Langflow tables or an external memory.',

  memoryInputVariable: {
    name: 'memoryInput',
    allowedTypes: ['Memory'],
    
  } as InputPortVariable,

  dataOutputVariable: {
    name: 'dataOutput',
    outputType: 'Data',
  } as OutputPortVariable,

  messageOutputVariable: {
    name: 'messageOutput',
    outputType: 'Message',
  } as OutputPortVariable,

  dataframeOutputVariable: {
    name: 'dataframeOutput',
    outputType: 'DataFrame',
  } as OutputPortVariable,
}
