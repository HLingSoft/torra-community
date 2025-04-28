import type { FlowNode, BuildContext } from '~/types/workflow'
import type { MilvusData } from '@/types/node-data/milvus'

import { resolveInputVariables, wrapRunnable } from '../../langchain/resolveInput'
import { RunnableLambda } from '@langchain/core/runnables'
import { Milvus } from '@langchain/community/vectorstores/milvus'
import type { MilvusLibArgs } from '@langchain/community/vectorstores/milvus'
import type { Document } from '@langchain/core/documents'


export async function milvusFactory(node: FlowNode, context: BuildContext) {
  /* ---------- 1. 解析输入 ---------- */
  const data = node.data as MilvusData
  const {
    collectionNameVariable, connectionURIVariable, tokenVariable,
    searchQueryVariable, resultOutputVariable, dataframeOutputVariable,
    vectorFieldVariable, primaryFieldVariable, partitionKeyVariable,
    partitionValueVariable, textFieldVariable, ingestDataVariable,
    embeddingVariable,
  } = data

  const def = [
    collectionNameVariable, connectionURIVariable, tokenVariable,
    searchQueryVariable, vectorFieldVariable, primaryFieldVariable,
    partitionKeyVariable, partitionValueVariable, textFieldVariable,
    ingestDataVariable, embeddingVariable,
  ]

  const v = await resolveInputVariables(context, def)

  /* ---------- 2. 参数快照 ---------- */
  const collectionName = v[collectionNameVariable.name]
  const url = v[connectionURIVariable.name]
  const token = v[tokenVariable.name]
  const query = v[searchQueryVariable.name]
  const vectorField = v[vectorFieldVariable.name]
  const primaryField = v[primaryFieldVariable.name]
  const partitionKey = v[partitionKeyVariable.name]
  const partitionValue = v[partitionValueVariable.name]
  const textField = v[textFieldVariable.name]
  const ingestData = v[ingestDataVariable.name]
  const embedding = v[embeddingVariable.name]

  if (!embedding)
    throw new Error('Milvus 节点需要一个有效的 Embedding 实例')

  /* ---------- 2. 懒执行 runnable：用 from() ---------- */
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

    if (data.ingestDataVariable.connected && ingestData) {
      const docs = JSON.parse(ingestData)
      await store.addDocuments(docs)
    }

    const filter =
      partitionKey && partitionValue
        ? `${partitionKey} == "${partitionValue}"`
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
  )

  return {
    [resultOutputVariable.id]: wrapped,
    [dataframeOutputVariable.id]: wrapped, // 如需 DataFrame，可在 resolve 阶段转换
  }
}

export function filterTopRelevantDocs(
  results: [Document, number][],
  maxStaticThreshold = 0.4,
  maxCount = 30
): [Document, number][] {
  if (results.length === 0) return [];

  // 先按得分升序（距离越小越相似）
  const sorted = results.sort((a, b) => a[1] - b[1]);

  // 取前 20 条样本
  const sampleSize = Math.min(20, sorted.length);
  const sampleScores = sorted.slice(0, sampleSize).map(([_, score]) => score);

  const avgScore = sampleScores.reduce((sum, s) => sum + s, 0) / sampleSize;
  const dynamicThreshold = avgScore * 1.3; // 乘系数，让它稍微松一点

  const finalThreshold = Math.min(dynamicThreshold, maxStaticThreshold);

  console.log(`🧮 采样均值 = ${avgScore.toFixed(4)}, 动态阈值 = ${dynamicThreshold.toFixed(4)}, 最终阈值 = ${finalThreshold.toFixed(4)}`);

  const seen = new Set<string>();
  const kept: [Document, number][] = [];

  for (const [doc, score] of sorted) {
    const documentId = doc.metadata?.documentId;
    if (score > finalThreshold) break; // 超过阈值直接停
    if (!documentId || seen.has(documentId)) continue; // 跳过重复

    kept.push([doc, score]);
    seen.add(documentId);

    if (kept.length >= maxCount) break;
  }

  if (kept.length === 0) {
    console.warn('⚠️ 全部被过滤，只保留最相关的一条作为兜底');
    kept.push(sorted[0]);
  }

  console.log(`✅ 最终保留 ${kept.length} 条，最高得分 ${kept[0][1].toFixed(4)}`);

  return kept;
}


