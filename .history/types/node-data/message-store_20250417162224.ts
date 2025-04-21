import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageStoreData {
  type: string
  title: string
  description: string
  icon?: string

  messageInputVariable: InputPortVariable
  memoryInputVariable: InputPortVariable

  storedMessagesOutputVariable: OutputPortVariable
}
export const MessageStoreLangchainName = 'MessageStore'

export const messageStoreMeta: MessageStoreData = {
  type: MessageStoreLangchainName,
  title: 'Message Store',
  icon: '💾',
  description: 'Stores a message into external memory like Redis.',

  messageInputVariable: {
    name: 'messageInput',
    allowedTypes: ['Message'],
    value: '',
  },
  memoryInputVariable: {
    name: 'memoryInput',
    allowedTypes: ['Memory'],
    value: '',
  },
  storedMessagesOutputVariable: {
    name: 'storedMessages',
    outputType: 'Data',
  },
}
