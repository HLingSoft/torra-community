import type { IDGeneratorData } from '~~/types/node-data/id-generator'
import type {
  BuildContext,
  LangFlowNode
} from '~~/types/workflow'
import { writeLogs } from '../utils'

/** ID 生成器节点工厂函数 */
export async function iDGeneratorFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const t0 = performance.now()
  const data = node.data as IDGeneratorData
  const { inputValue, outputVariable } = data

  const elapsed = performance.now() - t0
  // ✅ 写入结构化日志
  writeLogs(context, node.id, data.title, data.type, {
    [outputVariable.id]: {
      content: inputValue,
      outputPort: outputVariable,
      elapsed,
    }
  }, elapsed)

  return {
    [outputVariable.id]: inputValue
  }
}
