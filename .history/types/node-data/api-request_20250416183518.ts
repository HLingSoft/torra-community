import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface APIRequestData {
  type: string
  title: string
  description: string
  icon?: string

  modelName: string
  apiKeyVariable: InputPortVariable
  outputVariable: OutputPortVariable

  show?: boolean
  saved?: boolean
}

export const OpenAIEmbeddingsLangchainName = 'OpenAIEmbeddings'

export const openAIEmbeddingsMeta: APIRequestData = {
  type: OpenAIEmbeddingsLangchainName,
  title: 'API Request',
  description: 'Make HTTP requests using URLs or cURL commands.',
  icon: '🧠',
  modelName: 'text-embedding-3-small',
  apiKeyVariable: {
    name: 'apiKeyInput',
    allowedTypes: ['Message'],
    value: '',
  } as InputPortVariable,
  outputVariable: {
    name: 'embeddings',
    outputType: 'Embeddings',
  } as OutputPortVariable,
  show: true,
}
