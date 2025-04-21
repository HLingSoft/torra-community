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
import  { ifElseFactory} from './if-else'
import { ifElseMeta } from '~/types/node-data/if-else'
import { iDGeneratorMeta } from '~/types/node-data/id-generator'
import { iDGeneratorFactory } from './id-generator'
import { milvusFactory} from './milvus'
import { milvusMeta} from '~/types/node-data/milvus'

 
import { openAIEmbeddingsMeta } from '~/types/node-data/openai-embeddings'
import { openAIEmbeddingsFactory } from './openai-embeddings'

import { apiRequestFactory} from './api-request'
import { apiRequestMeta } from '~/types/node-data/api-request'

 import { messageStoreMeta } from '~/types/node-data/message-store'
import { messageStoreFactory } from './message-store'

import {  redisChatMemoryFactory } from './memory-redis'
import { redisChatMemoryMeta } from '~/types/node-data/memory-redis'

import { messageHistoryFactory } './message-history'
import { messageHistoryMeta } from '~/types/node-data/message-history'

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
  nodeFactoryMap[redisChatMemoryMeta.type] = redisChatMemoryFactory

}
