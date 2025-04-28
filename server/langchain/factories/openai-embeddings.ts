import type { FlowNode, BuildContext } from '~/types/workflow'
import type { OpenAIEmbeddingsData } from '~/types/node-data/openai-embeddings'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { OpenAIEmbeddings } from '@langchain/openai'

export async function openAIEmbeddingsFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as OpenAIEmbeddingsData
  const { modelName, apiKeyVariable, baseURLVariable, outputVariable } = data

  const inputValues = await resolveInputVariables(context, [apiKeyVariable, baseURLVariable])
  const apiKey = inputValues[apiKeyVariable.name]
  const baseURL = inputValues[baseURLVariable.name]

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
    model: modelName,
    stripNewLines: true,

    dimensions: 1536,
    configuration: { baseURL },
  })

  //   const embeddings = new OpenAIEmbeddings({
  //     apiKey: "zk-d0f948e7d5d3c362d37f211e732b2a69", // In Node.js defaults to process.env.OPENAI_API_KEY
  //     model: 'text-embedding-3-large',
  //     dimensions: 1536,
  //     configuration: { baseURL: 'https://api.zhizengzeng.com/v1' }
  // });


  return {
    [outputVariable.id]: embeddings,
  }
}
