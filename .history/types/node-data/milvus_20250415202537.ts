// 1️⃣ Milvus 节点类型定义（根据 Langflow UI 完整字段）
import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MilvusData {
  type: string
  title: string
  icon?: string
  description: string

  collectionNameVariable: InputPortVariable
  collectionDescVariable: InputPortVariable
  connectionURIVariable: InputPortVariable
  tokenVariable: InputPortVariable

  primaryFieldVariable: InputPortVariable
  textFieldVariable: InputPortVariable
  vectorFieldVariable: InputPortVariable

  ingestDataVariable: InputPortVariable
  searchQueryVariable: InputPortVariable
  embeddingVariable: InputPortVariable

  resultOutputVariable: OutputPortVariable
  dataframeOutputVariable: OutputPortVariable

  show?: boolean
  saved?: boolean
}

export const MilvusLangchainName = 'MilvusRetriever'

export const milvusMeta: MilvusData = {
  icon: '📦',
  type: MilvusLangchainName,
  title: 'Milvus',
  description: 'Milvus vector store with search capabilities.',

  collectionNameVariable: {
    name: 'collectionName',
    allowedTypes: ['Message'],
    value: '',
    defaultValue: '',
  } as InputPortVariable,
  collectionDescVariable: {
    name: 'collectionDesc',
    allowedTypes: ['Message'],
    value: '',
    defaultValue: '',
  } as InputPortVariable,
  connectionURIVariable: {
    name: 'connectionURI',
    allowedTypes: ['Message'],
    value: 'http://localhost:19530',
  },
  tokenVariable: {
    name: 'token',
    allowedTypes: ['Message'],
    value: '',
  },
  primaryFieldVariable: {
    name: 'primaryField',
    allowedTypes: ['Message'],
    value: 'pk',
  },
  textFieldVariable: {
    name: 'textField',
    allowedTypes: ['Message'],
    value: 'text',
  },
  vectorFieldVariable: {
    name: 'vectorField',
    allowedTypes: ['Message'],
    value: 'vector',
  },
  ingestDataVariable: {
    name: 'ingestData',
    allowedTypes: ['Message'],
    value: '',
  },
  searchQueryVariable: {
    name: 'searchQuery',
    allowedTypes: ['Message'],
    value: '',
  },
  embeddingVariable: {
    name: 'embedding',
    allowedTypes: ['Vector'],
    value: '',
  },
  resultOutputVariable: {
    outputType: 'Message',
    name: 'searchResults',
  },
  dataframeOutputVariable: {
    outputType: 'DataFrame',
    name: 'dataFrame',
  },

  show: true,
  saved: false,
}
