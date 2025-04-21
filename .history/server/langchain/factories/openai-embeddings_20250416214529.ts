import type { FlowNode, BuildContext } from '~/types/workflow'
import type { OpenAIEmbeddingsData } from '~/types/node-data/openai-embeddings'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { OpenAIEmbeddings } from '@langchain/openai'

export async function openAIEmbeddingsFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as OpenAIEmbeddingsData
  const { modelName, apiKeyVariable, baseURLVariable, outputVariable } = data

  const inputValues = await resolveInputVariables(context, [apiKeyVariable,baseURLVariable])
  const apiKey = inputValues[apiKeyVariable.name]
  const baseURL = inputValues[baseURLVariable.name]

  const embeddings = new OpenAIEmbeddings({
  
    openAIApiKey: apiKey,
    batchSize: 768,
    model: modelName,
    stripNewLines: true,
    timeout: 10000,
    dimensions: 768,
    configuration: { baseURL },
  })

  return {
    [outputVariable.id]: embeddings,
  }
}
