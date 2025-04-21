import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface OpenAIEmbeddingsData {
  type: string
  title: string
  description: string
  icon?: string

  modelName: string
  apiKeyVariable: InputPortVariable
  baseURLVariable?: InputPortVariable
  outputVariable: OutputPortVariable

  show?: boolean
  saved?: boolean
}

export const OpenAIEmbeddingsLangchainName = 'OpenAIEmbeddings'

export const openAIEmbeddingsMeta: OpenAIEmbeddingsData = {
  type: OpenAIEmbeddingsLangchainName,
  title: 'OpenAI Embeddings',
  description: 'Generate embeddings using OpenAI models.',
  icon: '🧠',
  modelName: 'text-embedding-3-small',
  apiKeyVariable: {
    name: 'apiKeyInput',
    allowedTypes: ['Message'],
    value: '',
  } as InputPortVariable,
  baseURLVariable: {
    name: 'baseURLInput',
    allowedTypes: ['Message'],
 
  } as InputPortVariable,
  outputVariable: {
    name: 'embeddings',
    outputType: 'Embeddings',
  } as OutputPortVariable,
  show: true,
}
