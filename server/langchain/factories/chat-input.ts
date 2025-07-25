import type { ChatInputData } from '~~/types/node-data/chat-input'
import type {
  BuildContext,
  LangFlowNode,
  NodeFactory,
  OutputPortVariable,
} from '~~/types/workflow'
import { writeLogs } from '../utils'

/**
 * ChatInput 节点工厂函数
 * - 用于将静态输入字符串包装为 LangChain 的 HumanMessage
 * - 输出至指定的 OutputPortVariable
 */
export const chatInputFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const t0 = performance.now()
  const data = node.data as ChatInputData

  const outputVar = data.outputVariable as OutputPortVariable
  const outputPortId = outputVar.id
  const inputValue = data.inputValue || ''


  // ✅ 标准结构化日志写入
  const elapsed = performance.now() - t0
  writeLogs(context, node.id, data.title, data.type, {
    [outputPortId]: {
      content: inputValue,
      outputPort: outputVar,
      elapsed,
    }
  }, elapsed)

  return {
    [outputPortId]: inputValue,
  }
}
