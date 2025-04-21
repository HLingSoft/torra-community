import type { ChatInputData } from '@/types/node-data/chat-input'
import type {
  BuildContext,
  FlowNode,
  NodeFactory,

  OutputPortVariable,
} from '~/types/workflow'

import { HumanMessage } from '@langchain/core/messages'

export const chatInputFactory: NodeFactory = async (node: FlowNode, _context: BuildContext) => {
  // 强转一下 data 以便获取 outputVariable
  const data = node.data as ChatInputData
  const outputVar = data.outputVariable as OutputPortVariable

  // 如果没有定义 outputVariable.id，可以给个默认值
  const outputPortId = outputVar.id
  console.log('chatInputFactory:', JSON.stringify(new HumanMessage(data.inputValue || '')))

  return {
    [outputPortId]: new HumanMessage(data.inputValue || ''),
   
  }
}
