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

export const nodeFactoryMap: Record<string, NodeFactory> = {}

export const initFactories = () => {
  nodeFactoryMap[chatInputMeta.type] = chatInputFactory
  nodeFactoryMap[chatOpenAIMeta.type] = chatOpenAIFactory
  nodeFactoryMap[promptTemplateMeta.type] = promptTemplateFactory
  nodeFactoryMap[textInputMeta.type] = textInputFactory
  nodeFactoryMap[chatOutputMeta.type] = chatOutputFactory
}
