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
    resultOutputVariable,
    dataframeOutputVariable,
    vectorFieldVariable,
    primaryFieldVariable,
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
    textFieldVariable,
    ingestDataVariable,
  ]

  const inputValues = await resolveInputVariables(context, variableDefs)

  const collectionName = inputValues[collectionNameVariable.name]
  const url = inputValues[connectionURIVariable.name]
  const token = inputValues[tokenVariable.name]
  const query = inputValues[searchQueryVariable.name]
  const ingestData = inputValues[ingestDataVariable.name]

  const vectorField = inputValues[vectorFieldVariable.name] || 'vector'
  const primaryField = inputValues[primaryFieldVariable.name] || 'pk'
  const textField = inputValues[textFieldVariable.name] || 'text'
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

  if (ingestDataVariable.connected && ingestData) {
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
