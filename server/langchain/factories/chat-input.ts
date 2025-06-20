import type { ChatInputData } from '@/types/node-data/chat-input'
import type {
  BuildContext,
  LangFlowNode,
  NodeFactory,
  OutputPortVariable,
} from '~/types/workflow'


/**
 * ChatInput 节点工厂函数
 * - 用于将静态输入字符串包装为 LangChain 的 HumanMessage
 * - 输出至指定的 OutputPortVariable
 */
export const chatInputFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const data = node.data as ChatInputData
  const outputVar = data.outputVariable as OutputPortVariable
  const outputPortId = outputVar.id

  return {
    [outputPortId]: data.inputValue || '',
  }
}
