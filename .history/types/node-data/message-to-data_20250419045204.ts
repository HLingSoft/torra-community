import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageToDataData {
  title: string
  type: string
  icon?: string
  description: string
  inputVariable: InputPortVariable
  outputVariable: OutputPortVariable
  show: boolean
  saved: boolean
}
export const MessageToDataLangchainName = 'MessageTo'

export const messageToDataMeta: MessageToDataData = {
  title: 'Message → Text',
  description: 'Extract text content from a LangChain Message',
  type: MessageToDataLangchainName,
  icon: '🧵',
  inputVariable: {
    name: 'message',
    allowedTypes: ['Message'],
  } as InputPortVariable,
  outputVariable: {
    name: 'text',
    outputType: 'string',
  } as OutputPortVariable,
  show: true,
  saved: false,
}
