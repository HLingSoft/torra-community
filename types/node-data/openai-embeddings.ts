import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface OpenAIEmbeddingsData {
  type: string
  title: string
  description: string
  icon?: string

  modelName: string
  apiKeyInputVariable: InputPortVariable
  baseURLInputVariable: InputPortVariable
  outputVariable: OutputPortVariable

  show?: boolean
  saved?: boolean
}

export const OpenAIEmbeddingsLangchainName = 'OpenAIEmbeddings'

export const openAIEmbeddingsMeta: OpenAIEmbeddingsData = {
  type: OpenAIEmbeddingsLangchainName,
  title: 'OpenAI Embeddings',
  description: 'Generate embeddings using OpenAI models.',
  icon: 'streamline-logos:openai-logo',
  modelName: 'text-embedding-3-small',
  apiKeyInputVariable: {
    name: 'OpenAI API Key',
    allowedTypes: ['Data'],


  } as InputPortVariable,
  baseURLInputVariable: {
    name: 'Base Url',
    allowedTypes: ['Data'],

  } as InputPortVariable,
  outputVariable: {
    name: 'Returned Embeddings',
    outputType: 'Embedding',
  } as OutputPortVariable,
  show: true,
}
