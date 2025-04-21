import type { FlowNode, BuildContext } from '~/types/workflow'
import type { MilvusData } from '@/types/node-data/milvus'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { RunnableLambda } from '@langchain/core/runnables'
import { Milvus } from '@langchain/community/vectorstores/milvus'

export async function milvusFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MilvusData
  const {
    collectionNameVariable,
    connectionURIVariable,
    tokenVariable,
    searchQueryVariable,
    embeddingVariable,
    resultOutputVariable,
    dataframeOutputVariable,
    vectorFieldVariable,
    primaryFieldVariable,
    textFieldVariable,
    ingestDataVariable,
    enableIngest,
  } = data

  const variableDefs = [
    collectionNameVariable,
    connectionURIVariable,
    tokenVariable,
    searchQueryVariable,
    embeddingVariable,
    vectorFieldVariable,
    primaryFieldVariable,
    textFieldVariable,
    ingestDataVariable,
  ]

  const inputValues = await resolveInputVariables(context, variableDefs)

  const collectionName = inputValues[collectionNameVariable.name]
  const url = inputValues[connectionURIVariable.name]
  const token = inputValues[tokenVariable.name]
  const query = inputValues[searchQueryVariable.name]
  const embedding = inputValues[embeddingVariable.name]
  const ingestData = inputValues[ingestDataVariable.name]

  const vectorField = inputValues[vectorFieldVariable.name] || 'vector'
  const primaryField = inputValues[primaryFieldVariable.name] || 'pk'
  const textField = inputValues[textFieldVariable.name] || 'text'

  const vectorStore = new Milvus(embedding, {
    collectionName,
    url,
    username: '',
    password: token,
    ssl: true,
    vectorField,
    textField,
    primaryField,
    indexCreateOptions: {
      index_type: 'IVF_FLAT',
      metric_type: 'COSINE',
      params: { nlist: 4096 },
    },
  })

  await vectorStore.ensureCollection()
  await vectorStore.ensurePartition()

  if (enableIngest && ingestData) {
    try {
      const parsed = JSON.parse(ingestData)
      await vectorStore.addDocuments(parsed)
    } catch (err) {
      console.warn('⚠️ Ingest data 解析失败:', err)
    }
  }

  const results = await vectorStore.similaritySearch(query, 5)
  const merged = results.map((r: any) => r.pageContent).join('\n')

  return {
    [resultOutputVariable.id]: RunnableLambda.from(() => merged),
    [dataframeOutputVariable.id]: RunnableLambda.from(() => results),
  }
}
