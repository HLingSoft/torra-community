import type { TextInputData } from '@/types/node-data/text-input'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { resolveInputVariables, writeLogs } from '../utils'

/**
 * TextInput 节点工厂函数
 */
export const textInputFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const t0 = performance.now()
  const data = node.data as TextInputData


  // 统一解析所有输入端口
  const inputValues = await resolveInputVariables(context, [data.inputInputVariable])
  const inputValue = inputValues[data.inputInputVariable.id] as string
  const outputVar = data.outputVariable as OutputPortVariable
  const outputPortId = outputVar.id

  const elapsed = performance.now() - t0

  // 记录日志
  writeLogs(context, node.id, node.data.title, node.data.type, {
    [outputPortId]: {
      content: inputValue,
      outputPort: data.outputVariable,
      elapsed
    },
  }, elapsed)


  return {
    [outputPortId]: inputValue,
  }
}
