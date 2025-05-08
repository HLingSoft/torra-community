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

export const nodeFactoryMap: Record<string, NodeFactory> = {}

export const initFactories = () => {
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
}
