import type { LangFlowNode, BuildContext } from '~~/types/workflow'
import type { MilvusData } from '~~/types/node-data/milvus'

import { resolveInputVariables, writeLogs } from '../utils'

import { Milvus } from '@langchain/community/vectorstores/milvus'
import type { MilvusLibArgs } from '@langchain/community/vectorstores/milvus'
import type { Document } from '@langchain/core/documents'

export async function milvusFactory(node: LangFlowNode, context: BuildContext) {
  const t0 = performance.now()
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

  const result = top
    .map(([doc, score]) => `${doc.pageContent}\n`)
    .join('\n\n')

  const elapsed = performance.now() - t0
  /* ---------- 4. 写入结构化日志 ---------- */

  writeLogs(context, node.id, data.title, data.type, {
    [data.outputPortVariable.id]: {
      content: result,
      outputPort: data.outputPortVariable,
      elapsed
    }
  }, elapsed)

  return {
    [data.outputPortVariable.id]: result,
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
