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

  return {
    [outputPortId]: new HumanMessage(data.inputValue || ''),
    // // LangChain Runnable 接口：有个 invoke() 方法
    // invoke: async (input: Record<string, any>) => {
    //   // input.message 就是执行器里给的用户输入文本
    //   const userMessage = new HumanMessage(input.message || '')

    //   // 以 "端口ID" 为 key 返回一个对象
    //   // 这样 build.ts 里 results[node.id] 就能是 { [outputPortId]: HumanMessage(...) }
    //   return {
    //     [outputPortId]: userMessage,
    //   }
    // },
  }
}
