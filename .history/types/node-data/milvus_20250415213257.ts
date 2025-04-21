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
   
   
  } as InputPortVariable,
  collectionDescVariable: {
    name: 'collectionDesc',
    allowedTypes: ['Message'],
    defaultValue: 'system_01',

  } as InputPortVariable,
  connectionURIVariable: {
    name: 'connectionURI',
    allowedTypes: ['Message'],
    defaultValue: 'https://in05-37b92ef035357df.serverless.ali-cn-hangzhou.cloud.zilliz.com.cn',
  } as InputPortVariable,
  tokenVariable: {
    name: 'token',
    allowedTypes: ['Message'],
   
  } as InputPortVariable,
  primaryFieldVariable: {
    name: 'primaryField',
    allowedTypes: ['Message'],
    defaultValue: 'pk',
    
  } as InputPortVariable,
  textFieldVariable: {
    name: 'textField',
    allowedTypes: ['Message'],
   
  } as InputPortVariable,
  vectorFieldVariable: {
    name: 'vectorField',
    allowedTypes: ['Message'],
    
  } as InputPortVariable,
  ingestDataVariable: {
    name: 'ingestData',
    allowedTypes: ['Message'],
  
  } as InputPortVariable,
  searchQueryVariable: {
    name: 'searchQuery',
    allowedTypes: ['Message'],
   
  } as InputPortVariable,
  embeddingVariable: {
    name: 'embedding',
    allowedTypes: ['Vector'],
    
  } as InputPortVariable,
  resultOutputVariable: {
    outputType: 'Message',
    name: 'searchResults',
  } as OutputPortVariable,
  dataframeOutputVariable: {
    outputType: 'DataFrame',
    name: 'dataFrame',
  } as OutputPortVariable,
 
  show: true,
  saved: false,
}
