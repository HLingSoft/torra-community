// 1️⃣ Milvus 节点类型定义（根据 Langflow UI 完整字段）
import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MilvusData {
  type: string
  title: string
  icon?: string
  description: string

  collectionNameInputVariable: InputPortVariable
  // collectionDatabaseInputVariable: InputPortVariable
  connectionURIInputVariable: InputPortVariable
  tokenInputVariable: InputPortVariable

  primaryFieldInputVariable: InputPortVariable
  partitionKeyInputVariable: InputPortVariable
  partitionValueInputVariable: InputPortVariable

  textFieldInputVariable: InputPortVariable
  vectorFieldInputVariable: InputPortVariable

  ingestDataInputVariable: InputPortVariable
  searchQueryInputVariable: InputPortVariable
  embeddingInputVariable: InputPortVariable



  outputPortVariable: OutputPortVariable



  show?: boolean
  saved?: boolean
}

export const MilvusLangchainName = 'MilvusRetriever'

export const milvusMeta: MilvusData = {
  icon: 'logos:milvus-icon',
  type: MilvusLangchainName,
  title: 'Milvus',
  description: 'Milvus vector store with search capabilities.',

  collectionNameInputVariable: {
    name: 'Collection Name',
    allowedTypes: ['Data'],


  } as InputPortVariable,

  connectionURIInputVariable: {
    name: 'Connection URI',
    allowedTypes: ['Data'],
    defaultValue: '',

  } as InputPortVariable,
  tokenInputVariable: {
    name: 'Token',
    allowedTypes: ['Data'],


  } as InputPortVariable,
  primaryFieldInputVariable: {
    name: 'Primary Field',
    allowedTypes: ['Data'],
    defaultValue: 'pk',

  } as InputPortVariable,
  partitionKeyInputVariable: {
    name: 'Partition Key',
    allowedTypes: ['Data'],

  } as InputPortVariable,
  partitionValueInputVariable: {
    name: 'Partition Value',
    allowedTypes: ['Data'],


  } as InputPortVariable,
  textFieldInputVariable: {
    name: 'Text Field',
    allowedTypes: ['Data'],


  } as InputPortVariable,
  vectorFieldInputVariable: {
    name: 'Vector Field',
    allowedTypes: ['Data'],


  } as InputPortVariable,
  ingestDataInputVariable: {
    name: 'Ingest Data',
    allowedTypes: ['Data'],

  } as InputPortVariable,
  searchQueryInputVariable: {
    name: 'Search Query',
    allowedTypes: ['Data'],


  } as InputPortVariable,
  embeddingInputVariable: {
    name: 'Embedding',
    allowedTypes: ['Embedding'],

  } as InputPortVariable,
  outputPortVariable: {
    outputType: 'Data',
    name: 'When Done',
  } as OutputPortVariable,


  show: true,
  saved: false,
}
