import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageToDataData {
  title: string
  type: string
  icon?: string
  description: string
  inputInputVariable: InputPortVariable
  outputVariable: OutputPortVariable
  show: boolean
  saved: boolean
}
export const MessageToDataLangchainName = 'MessageToData'

export const messageToDataMeta: MessageToDataData = {
  title: 'Message To Data',
  description: 'Extract text content from a LangChain Message',
  type: MessageToDataLangchainName,
  icon: 'tabler:message-2-code',
  inputInputVariable: {
    name: 'Message',
    allowedTypes: ['Message'],

  } as InputPortVariable,
  outputVariable: {
    name: 'When Done',
    outputType: 'Data',
  } as OutputPortVariable,
  show: true,
  saved: false,
}
