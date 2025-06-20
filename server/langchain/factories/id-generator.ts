import type { IDGeneratorData } from '@/types/node-data/id-generator'
import type {
  BuildContext,
  LangFlowNode
} from '~/types/workflow'
import { writeLog } from '../../langchain/resolveInput'

/** ID 生成器节点工厂函数 */
export async function iDGeneratorFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const data = node.data as IDGeneratorData
  const { inputValue, outputVariable } = data


  return {
    [outputVariable.id]: inputValue
  }
}
