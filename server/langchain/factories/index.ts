import type { NodeFactory } from '~/types/workflow'
import { chatInputMeta } from '@/types/node-data/chat-input'
import { chatOpenAIMeta } from '@/types/node-data/chat-openai'
import { chatOutputMeta } from '@/types/node-data/chat-output'
import { promptTemplateMeta } from '@/types/node-data/prompt-template'
import { textInputMeta } from '~/types/node-data/text-input'
import { chatInputFactory } from './chat-input'
import { chatOpenAIFactory } from './chat-openai'
import { chatOutputFactory } from './chat-output'
import { promptTemplateFactory } from './prompt-template'
import { textInputFactory } from './text-input'
import { ifElseFactory } from './if-else'
import { ifElseMeta } from '~/types/node-data/if-else'
import { iDGeneratorMeta } from '~/types/node-data/id-generator'
import { iDGeneratorFactory } from './id-generator'
import { milvusFactory } from './milvus'
import { milvusMeta } from '~/types/node-data/milvus'


import { openAIEmbeddingsMeta } from '~/types/node-data/openai-embeddings'
import { openAIEmbeddingsFactory } from './openai-embeddings'

import { apiRequestFactory } from './api-request'
import { apiRequestMeta } from '~/types/node-data/api-request'

import { messageStoreMeta } from '~/types/node-data/message-store'
import { messageStoreFactory } from './message-store'

import { upstashRedisChatMemoryFactory } from './memory-upstash-redis'
import { upstashRedisChatMemoryMeta } from '~/types/node-data/memory-redis'

import { messageHistoryFactory } from './message-history'
import { messageHistoryMeta } from '~/types/node-data/message-history'
import { timezoneFactory } from './timezone'
import { timezoneMeta } from '~/types/node-data/timezone'

import { structuredOutputFactory } from './structured-output'
import { structuredOutputMeta } from '~/types/node-data/structured-output'

import { messageToDataFactory } from './message-to-data'
import { messageToDataMeta } from '~/types/node-data/message-to-data'

import { textOutputFactory } from './text-output'
import { textOutputMeta } from '~/types/node-data/text-output'
import { filterDataFactory } from './filter-data'
import { filterDataMeta } from '~/types/node-data/filter-data'

import { apiInputFactory } from './api-input'
import { apiInputMeta } from '~/types/node-data/api-input'

import { mcpHttpFactory } from './mcp-http'
import { mcpHttpMeta } from '~/types/node-data/mcp-http'

import { agentFactory } from './agent'
import { agentMeta } from '~/types/node-data/agent'

import { apiToolFactory } from './api-tool'
import { apiToolMeta } from '~/types/node-data/api-tool'

import { jsonParserFactory } from './json-parser'
import { jsonParserMeta } from '~/types/node-data/json-parser'

import { subWorkflowFactory } from './sub-workflow'
import { subWorkflowMeta } from '~/types/node-data/sub-workflow'

import { listOutputFactory } from './list-output'
import { listOutputMeta } from '~/types/node-data/list-output'

import { loopFactory } from './loop'
import { loopMeta } from '~/types/node-data/loop'

import { dataToMessageFactory } from './data-to-message'
import { dataToMessageMeta } from '~/types/node-data/data-to-message'

import { passFactory } from './pass'
import { passMeta } from '~/types/node-data/pass'

import { listenFactory } from './listen'
import { listenMeta } from '~/types/node-data/listen'

import { notifyFactory } from './notify'
import { notifyMeta } from '~/types/node-data/notify'

import { imageRecognitionOpenAIFactory } from './image-recognition-openai'
import { imageRecognitionOpenAIMeta } from '~/types/node-data/image-recognition-openai'

import { imageGenerateOpenAIFactory } from './image-generate-openai'
import { imageGenerateOpenAIMeta } from '~/types/node-data/image-generate-openai'




import { urlFactory } from './url'
import { urlMeta } from '~/types/node-data/url'


import { combineDataFactory } from './combine-data'
import { combineDataMeta } from '~/types/node-data/combine-data'

import { speechRecognitionOpenAIFactory } from './speech-recognition-openai'
import { speechRecognitionOpenAIMeta } from '~/types/node-data/speech-recognition-openai'

import { speechGenerateOpenAIFactory } from './speech-generate-openai'
import { speechGenerateOpenAIMeta } from '~/types/node-data/speech-generate-openai'

import { structuredToDataFactory } from './structured-to-data'
import { structuredToDataMeta } from '~/types/node-data/structured-to-data'

import { dataToStructuredFactory } from './data-to-structured'
import { dataToStructuredMeta } from '~/types/node-data/data-to-structured'

export const nodeFactoryMap: Record<string, NodeFactory> = {}

export const initFactories = () => {
  console.log('🎯 initFactories 被调用');
  nodeFactoryMap[chatInputMeta.type] = chatInputFactory
  nodeFactoryMap[chatOpenAIMeta.type] = chatOpenAIFactory
  nodeFactoryMap[promptTemplateMeta.type] = promptTemplateFactory
  nodeFactoryMap[textInputMeta.type] = textInputFactory
  nodeFactoryMap[chatOutputMeta.type] = chatOutputFactory
  nodeFactoryMap[ifElseMeta.type] = ifElseFactory
  nodeFactoryMap[iDGeneratorMeta.type] = iDGeneratorFactory
  nodeFactoryMap[milvusMeta.type] = milvusFactory
  nodeFactoryMap[openAIEmbeddingsMeta.type] = openAIEmbeddingsFactory
  nodeFactoryMap[apiRequestMeta.type] = apiRequestFactory
  nodeFactoryMap[messageStoreMeta.type] = messageStoreFactory
  nodeFactoryMap[messageHistoryMeta.type] = messageHistoryFactory
  nodeFactoryMap[upstashRedisChatMemoryMeta.type] = upstashRedisChatMemoryFactory

  nodeFactoryMap[timezoneMeta.type] = timezoneFactory

  nodeFactoryMap[structuredOutputMeta.type] = structuredOutputFactory
  nodeFactoryMap[messageToDataMeta.type] = messageToDataFactory

  nodeFactoryMap[textOutputMeta.type] = textOutputFactory

  nodeFactoryMap[filterDataMeta.type] = filterDataFactory

  nodeFactoryMap[apiInputMeta.type] = apiInputFactory

  nodeFactoryMap[mcpHttpMeta.type] = mcpHttpFactory

  nodeFactoryMap[agentMeta.type] = agentFactory

  nodeFactoryMap[apiToolMeta.type] = apiToolFactory

  nodeFactoryMap[jsonParserMeta.type] = jsonParserFactory

  nodeFactoryMap[subWorkflowMeta.type] = subWorkflowFactory

  nodeFactoryMap[listOutputMeta.type] = listOutputFactory
  nodeFactoryMap[loopMeta.type] = loopFactory


  nodeFactoryMap[dataToMessageMeta.type] = dataToMessageFactory

  nodeFactoryMap[passMeta.type] = passFactory

  nodeFactoryMap[listenMeta.type] = listenFactory

  nodeFactoryMap[notifyMeta.type] = notifyFactory

  nodeFactoryMap[imageRecognitionOpenAIMeta.type] = imageRecognitionOpenAIFactory

  nodeFactoryMap[imageGenerateOpenAIMeta.type] = imageGenerateOpenAIFactory



  nodeFactoryMap[urlMeta.type] = urlFactory
  nodeFactoryMap[combineDataMeta.type] = combineDataFactory

  nodeFactoryMap[speechRecognitionOpenAIMeta.type] = speechRecognitionOpenAIFactory

  nodeFactoryMap[structuredToDataMeta.type] = structuredToDataFactory

  nodeFactoryMap[dataToStructuredMeta.type] = dataToStructuredFactory

  nodeFactoryMap[speechGenerateOpenAIMeta.type] = speechGenerateOpenAIFactory

}
