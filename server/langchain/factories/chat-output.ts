import type { ChatOutputData } from '@/types/node-data/chat-output'
import type {
  BuildContext,
  LangFlowNode,
  InputPortVariable,
} from '~/types/workflow'

import {
  resolveInputVariables,
  writeLogs
} from '../utils'

/** ChatOutput 节点工厂函数 */
export async function chatOutputFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const t0 = performance.now()
  const data = node.data as ChatOutputData
  const {
    inputInputVariable,
    outputVariable
  } = data

  const variableDefs: InputPortVariable[] = [inputInputVariable]
  const inputValues = await resolveInputVariables(context, variableDefs)
  const inputValue = inputValues[inputInputVariable.id]
  const outputPortId = outputVariable.id

  const elapsed = performance.now() - t0
  // ✅ 写入日志：结构化
  writeLogs(context, node.id, data.title, data.type, {
    [outputPortId]: {
      content: inputValue,
      outputPort: outputVariable,
      elapsed
    }
  }, elapsed)

  return {
    [outputPortId]: inputValue,
    default: inputValue
  }
}
