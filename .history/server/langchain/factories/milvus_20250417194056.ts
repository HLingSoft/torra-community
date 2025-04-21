import type { FlowNode, BuildContext } from '~/types/workflow'
import type { MilvusData } from '@/types/node-data/milvus'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { RunnableLambda } from '@langchain/core/runnables'
import { Milvus } from '@langchain/community/vectorstores/milvus'
import type { Document } from '@langchain/core/documents'
import { formatDocumentsAsString } from 'langchain/util/document'
import type { MilvusLibArgs } from '@langchain/community/vectorstores/milvus'
export async function milvusFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MilvusData
  const {
    collectionNameVariable,
    connectionURIVariable,
    tokenVariable,
    searchQueryVariable,
    resultOutputVariable,
    dataframeOutputVariable,
    vectorFieldVariable,
    primaryFieldVariable,
    partitionKeyVariable,
    partitionValueVariable,
    textFieldVariable,
    ingestDataVariable,
    embeddingVariable,
  } = data

  const variableDefs = [
    collectionNameVariable,
    connectionURIVariable,
    tokenVariable,
    searchQueryVariable,
    vectorFieldVariable,
    primaryFieldVariable,
    partitionKeyVariable,
    partitionValueVariable,
    textFieldVariable,
    ingestDataVariable,
  ]

  const inputValues = await resolveInputVariables(context, variableDefs)

  const collectionName = inputValues[collectionNameVariable.name]
  const url = inputValues[connectionURIVariable.name]
  const token = inputValues[tokenVariable.name]
  const query = inputValues[searchQueryVariable.name]
 

  const vectorField = inputValues[vectorFieldVariable.name]  
  const primaryField = inputValues[primaryFieldVariable.name]  
  const partitionKey = inputValues[partitionKeyVariable.name]
  const partitionValue = inputValues[partitionValueVariable.name]
  const textField = inputValues[textFieldVariable.name]  

  
  // 2. 获取 embedding 对象（必须来自连接）
  const edge = context.json.edges.find((e: any) => e.target === embeddingVariable.id)
  if (!edge) throw new Error('Milvus 节点未连接 Embedding 模型')

  const sourcePortId = edge.source
  const upstreamNodeId = context.json.nodes[sourcePortId]?.data?.parentNode
  const upstreamResult = context.results?.[upstreamNodeId]
  const rawEmbedding = upstreamResult?.[sourcePortId] ?? Object.values(upstreamResult || {})[0]

  const embedding = typeof rawEmbedding?.invoke === 'function'
    ? await rawEmbedding.invoke({})
    : rawEmbedding

  if (!embedding) {
    throw new Error('Milvus 节点需要一个有效的 Embedding 实例')
  }
  const options: MilvusLibArgs = {
    collectionName,
    url,
    ssl: true,
    clientConfig: {
      address: url,
      token: token,
    },
    indexCreateOptions: {
      index_type: 'IVF_FLAT',
      metric_type: 'COSINE',
      params: { nlist: 4096 },
    },
  }
  console.log('vectorField',vectorField)
  console.log('textField',textField)
  console.log('primaryField',primaryField)
  console.log('partitionKey',partitionKey)
  console.log('partitionValue',partitionValue)
  
  // 👇 如果这些值存在，就动态添加进去
  if (vectorField) options.vectorField = vectorField
  if (textField) options.textField = textField
  if (primaryField) options.primaryField = primaryField
  if (partitionKey) options.partitionKey = partitionKey
 
  
  const vectorStore = new Milvus(embedding, options)

  await vectorStore.ensureCollection()
  await vectorStore.ensurePartition()

  if (ingestDataVariable.connected ) {
    const edge = context.json.edges.find((e: any) => e.target === ingestDataVariable.id)
    if (!edge) throw new Error('ingestData 节点未连接 ')
    try {

      const sourcePortId = edge.source
      const upstreamNodeId = context.json.nodes[sourcePortId]?.data?.parentNode
      const upstreamResult = context.results?.[upstreamNodeId]
      const rawEmbedding = upstreamResult?.[sourcePortId] ?? Object.values(upstreamResult || {})[0]
    
      const ingestData = typeof rawEmbedding?.invoke === 'function'
        ? await rawEmbedding.invoke({})
        : rawEmbedding
    
      if (!ingestData) {
        throw new Error('ingestData 节点需要有效的数据')
      }



      const parsed = JSON.parse(ingestData)
      await vectorStore.addDocuments(parsed)
    } catch (err) {
      console.warn('⚠️ Ingest data 解析失败:', err)
    }
  } 
  let filter;
  if(partitionValue && partitionKey){
    
    filter= `projectId == "${partitionValue}"`
  }
  
  const results = await vectorStore.similaritySearch(query, 5,filter)
  const uniqueDocuments = Array.from(new Set(results.map((doc: Document) => doc.pageContent)))
  .map(pageContent => results.find((doc: Document) => doc.pageContent === pageContent)) as Document[]

 
  const merged = `${formatDocumentsAsString(uniqueDocuments)}\n\n`
  console.log('MilvusFactory', merged)

  return {
    [resultOutputVariable.id]: RunnableLambda.from(() => merged),
    [dataframeOutputVariable.id]: RunnableLambda.from(() => merged),
  }
}
