import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { MilvusData } from '@/types/node-data/milvus'

import { resolveInputVariables, wrapRunnable, writeLog } from '../../langchain/resolveInput'
import { RunnableLambda } from '@langchain/core/runnables'
import { Milvus } from '@langchain/community/vectorstores/milvus'
import type { MilvusLibArgs } from '@langchain/community/vectorstores/milvus'
import type { Document } from '@langchain/core/documents'

export async function milvusFactory(node: LangFlowNode, context: BuildContext) {
  /* ---------- 1. 解析输入 ---------- */
  const data = node.data as MilvusData

  const variables = [
    data.collectionNameInputVariable,
    data.connectionURIInputVariable,
    data.tokenInputVariable,
    data.searchQueryInputVariable,
    data.vectorFieldInputVariable,
    data.primaryFieldInputVariable,
    data.partitionKeyInputVariable,
    data.partitionValueInputVariable,
    data.textFieldInputVariable,
    data.ingestDataInputVariable,
    data.embeddingInputVariable,
  ]

  const v = await resolveInputVariables(context, variables)

  const collectionName = v[data.collectionNameInputVariable.id]
  const url = v[data.connectionURIInputVariable.id]
  const token = v[data.tokenInputVariable.id]
  const query = v[data.searchQueryInputVariable.id]
  const vectorField = v[data.vectorFieldInputVariable.id]
  const primaryField = v[data.primaryFieldInputVariable.id]
  const partitionKey = v[data.partitionKeyInputVariable.id]
  const partitionValue = v[data.partitionValueInputVariable.id]
  const textField = v[data.textFieldInputVariable.id]
  const ingestData = v[data.ingestDataInputVariable.id]
  const embedding = v[data.embeddingInputVariable.id]

  if (!embedding)
    throw new Error('Milvus 节点需要一个有效的 Embedding 实例')

  /* ---------- 2. 延迟执行 Runnable ---------- */
  const searchRunnable = RunnableLambda.from(async () => {
    const opts: MilvusLibArgs = {
      collectionName,
      url,
      ssl: true,
      clientConfig: { address: url, token },
      indexCreateOptions: {
        index_type: 'IVF_FLAT',
        metric_type: 'COSINE',
        params: { nlist: 1024 },
        search_params: { nprobe: 16 },
      },
    }

    if (vectorField) opts.vectorField = vectorField
    if (textField) opts.textField = textField
    if (primaryField) opts.primaryField = primaryField
    if (partitionKey) opts.partitionKey = partitionKey

    const store = new Milvus(embedding, opts)

    await store.ensureCollection()
    await store.ensurePartition()

    if (data.ingestDataInputVariable.connected && ingestData) {
      const docs = JSON.parse(ingestData)
      await store.addDocuments(docs)
    }

    const filter =
      partitionKey && partitionValue
        ? `${partitionKey} == \"${partitionValue}\"`
        : undefined

    const raw = await store.similaritySearchWithScore(query, 30, filter)
    const top = filterTopRelevantDocs(raw)

    return top
      .map(([doc, score]) => `${doc.pageContent}\n\n${score}`)
      .join('\n\n')
  })

  /* ---------- 3. 包装延迟执行并返回 ---------- */
  const wrapped = wrapRunnable(
    searchRunnable,
    node.id,
    context.onRunnableElapsed,
    {
      context,
      portId: data.outputPortVariable.id,
    }
  )

  // writeLog(
  //   context,
  //   node.id,
  //   data.outputPortVariable.id,
  //   `Milvus collection: ${collectionName}, URL: ${url}`,
  // )

  return {
    [data.outputPortVariable.id]: wrapped,
  }
}

function filterTopRelevantDocs(
  results: [Document, number][],
  maxStaticThreshold = 0.4,
  maxCount = 30
): [Document, number][] {
  if (results.length === 0) return [];

  const sorted = results.sort((a, b) => a[1] - b[1]);

  const sampleSize = Math.min(20, sorted.length);
  const sampleScores = sorted.slice(0, sampleSize).map(([_, score]) => score);

  const avgScore = sampleScores.reduce((sum, s) => sum + s, 0) / sampleSize;
  const dynamicThreshold = avgScore * 1.3;

  const finalThreshold = Math.min(dynamicThreshold, maxStaticThreshold);

  const seen = new Set<string>();
  const kept: [Document, number][] = [];

  for (const [doc, score] of sorted) {
    const documentId = doc.metadata?.documentId;
    if (score > finalThreshold) break;
    if (!documentId || seen.has(documentId)) continue;

    kept.push([doc, score]);
    seen.add(documentId);

    if (kept.length >= maxCount) break;
  }

  if (kept.length === 0) kept.push(sorted[0]);

  return kept;
}
