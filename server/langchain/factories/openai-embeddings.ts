import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { OpenAIEmbeddingsData } from '@/types/node-data/openai-embeddings'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'
import { OpenAIEmbeddings } from '@langchain/openai'

/**
 * OpenAIEmbeddings 节点工厂函数
 */
export async function openAIEmbeddingsFactory(node: LangFlowNode, context: BuildContext) {
  const data = node.data as OpenAIEmbeddingsData
  const { modelName, apiKeyInputVariable, baseURLInputVariable, outputVariable } = data

  // 解析 API Key 和 BaseURL 变量
  const inputValues = await resolveInputVariables(context, [apiKeyInputVariable, baseURLInputVariable])
  const apiKey = inputValues[apiKeyInputVariable.id]
  const baseURL = inputValues[baseURLInputVariable.id]

  // 创建 OpenAI Embeddings 实例
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
    model: modelName,
    stripNewLines: true,
    dimensions: 1536,
    configuration: { baseURL },
  })

  // writeLog(
  //   context,
  //   node.id,
  //   outputVariable.id,
  //   `OpenAIEmbeddings ${modelName} 初始化成功`,
  // )

  return {
    [outputVariable.id]: embeddings,
  }
}
