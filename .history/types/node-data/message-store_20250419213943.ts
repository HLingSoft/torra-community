import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageStoreData {
  type: string
  title: string
  description: string
  icon?: string

  messageInputVariable: InputPortVariable
  role: string
  memoryInputVariable: InputPortVariable

  storedMessagesOutputVariable: OutputPortVariable
}
export const MessageStoreLangchainName = 'MessageStore'

export const messageStoreMeta: MessageStoreData = {
  type: MessageStoreLangchainName,
  title: 'Message Store',
  icon: '💾',
  description: 'Stores a message into external memory like Redis.',
  role:'AI',
  messageInputVariable: {
    name: 'messageInput',
    allowedTypes: ['Message'],
    forceStringify: true,
    
  } as InputPortVariable,
  memoryInputVariable: {
    name: 'memoryInput',
    allowedTypes: ['Memory'],
   
  } as InputPortVariable,
  storedMessagesOutputVariable: {
    name: 'storedMessages',
    outputType: 'Message',
  } as OutputPortVariable,
}
