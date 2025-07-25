import type {
  BuildContext,
  LangFlowNode,
  NodeFactory,
  InputPortVariable
} from '~~/types/workflow'
import type { MessageToDataData } from '~~/types/node-data/message-to-data'
import { resolveInputVariables, writeLogs } from '../utils'

/**
 * MessageToData 节点工厂函数
 */
export const messageToDataFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const t0 = performance.now()

  const { inputInputVariable, outputVariable, title, type } = node.data as MessageToDataData

  const variableDefs = [inputInputVariable] as InputPortVariable[]
  const inputValues = await resolveInputVariables(context, variableDefs)

  const result = inputValues[inputInputVariable.id]
  const content = result?.content ?? ''
  const elapsed = performance.now() - t0

  // ✅ 结构化写日志
  writeLogs(context, node.id, title, type, {
    [outputVariable.id]: {
      content,
      outputPort: outputVariable,
      elapsed
    }
  }, elapsed)

  return {
    [outputVariable.id]: content
  }
}
