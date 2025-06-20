import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageStoreData {
  type: string
  title: string
  description: string
  icon?: string

  messageInputVariable: InputPortVariable
  // role: string
  memoryInputVariable: InputPortVariable

  storedMessagesOutputVariable: OutputPortVariable
  dataOutputVariable: OutputPortVariable
}
export const MessageStoreLangchainName = 'MessageStore'

export const messageStoreMeta: MessageStoreData = {
  type: MessageStoreLangchainName,
  title: 'Message Store',
  icon: 'streamline-plump-color:store-2-flat',
  description: 'Stores a message into external memory like Redis.',
  // role: 'AI',
  messageInputVariable: {
    name: 'Message',
    allowedTypes: ['Message'],


  } as InputPortVariable,
  memoryInputVariable: {
    name: 'Memory',
    allowedTypes: ['Memory'],

  } as InputPortVariable,
  storedMessagesOutputVariable: {
    name: 'Return Stored Message',
    outputType: 'Message',
  } as OutputPortVariable,
  dataOutputVariable: {
    name: 'Return Data',
    outputType: 'Data',
  } as OutputPortVariable,
}
