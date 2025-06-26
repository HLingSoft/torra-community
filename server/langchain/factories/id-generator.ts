import type { IDGeneratorData } from '@/types/node-data/id-generator'
import type {
  BuildContext,
  LangFlowNode
} from '~/types/workflow'
import { writeLogs } from '../utils'

/** ID 生成器节点工厂函数 */
export async function iDGeneratorFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const data = node.data as IDGeneratorData
  const { inputValue, outputVariable } = data

  // ✅ 写入结构化日志
  writeLogs(context, node.id, data.title, data.type, {
    [outputVariable.id]: {
      content: inputValue,
      outputPort: outputVariable,
      elapsed: 0,
    }
  }, 0)

  return {
    [outputVariable.id]: inputValue
  }
}
