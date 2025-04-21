import type { FlowNode, BuildContext } from '~/types/workflow'
import type { OpenAIEmbeddingsData } from '~/types/node-data/openai-embeddings'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { OpenAIEmbeddings } from '@langchain/openai'

export async function openAIEmbeddingsFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as OpenAIEmbeddingsData
  const { modelName, apiKeyVariable, outputVariable } = data

  const inputValues = await resolveInputVariables(context, [apiKeyVariable])
  const apiKey = inputValues[apiKeyVariable.name]

  const embeddings = new OpenAIEmbeddings({
    modelName,
    openAIApiKey: apiKey,
  })

  return {
    [outputVariable.id]: embeddings,
  }
}
