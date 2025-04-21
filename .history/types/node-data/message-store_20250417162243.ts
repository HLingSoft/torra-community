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
  } as InputPortVariable,
  memoryInputVariable: {
    name: 'memoryInput',
    allowedTypes: ['Memory'],
    value: '',
  } as InputPortVariable,
  storedMessagesOutputVariable: {
    name: 'storedMessages',
    outputType: 'Message',
  } as OutputPortVariable,
}
