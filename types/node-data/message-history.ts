import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageHistoryData {
  type: string
  title: string
  description: string
  icon?: string

  memoryInputVariable: InputPortVariable
  maxMessages: number

  dataOutputVariable: OutputPortVariable
  messageOutputVariable: OutputPortVariable

}
export const MessageHistoryLangchainName = 'MessageHistory'

export const messageHistoryMeta: MessageHistoryData = {
  type: MessageHistoryLangchainName,
  title: 'Message History',
  icon: 'solar:history-line-duotone',
  description: 'Retrieves stored chat messages from Langflow tables or an external memory.',
  maxMessages: 100,
  memoryInputVariable: {
    name: 'Memory',
    allowedTypes: ['Memory'],
  } as InputPortVariable,

  dataOutputVariable: {
    name: 'Return Data',
    outputType: 'Data',
  } as OutputPortVariable,

  messageOutputVariable: {
    name: 'Return Messages',
    outputType: 'Message[]',
  } as OutputPortVariable,


}
