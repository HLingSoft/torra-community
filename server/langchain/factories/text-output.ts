import type { TextOutputData } from '@/types/node-data/text-output'
import type { BuildContext, LangFlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'
import { resolveInputVariables, writeLogs } from '../utils'

/**
 * TextOutput 节点工厂函数
 */
export const textOutputFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const t0 = performance.now()
  const data = node.data as TextOutputData


  // 统一解析输入
  const inputValues = await resolveInputVariables(context, [data.messageInputVariable])
  const inputValue = inputValues[data.messageInputVariable.id] as string
  const outputVar = data.outputVariable as OutputPortVariable
  const outputPortId = outputVar.id

  const elapsed = performance.now() - t0
  // 记录日志
  writeLogs(context, node.id, node.data.title, node.data.type, {
    [outputPortId]: {
      content: inputValue,
      outputPort: data.outputVariable,
      elapsed, // 这里可以计算实际耗时
    },
  }, elapsed)

  return {
    [outputPortId]: inputValue,
    default: inputValue,
  }
}
