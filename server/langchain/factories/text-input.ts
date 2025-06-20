import type { TextInputData } from '@/types/node-data/text-input'
import type { BuildContext, LangFlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { HumanMessage } from '@langchain/core/messages'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

/**
 * TextInput 节点工厂函数
 */
export const textInputFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const data = node.data as TextInputData


  // 统一解析所有输入端口
  const inputValues = await resolveInputVariables(context, [data.inputInputVariable])
  const inputValue = inputValues[data.inputInputVariable.id] as string
  const outputVar = data.outputVariable as OutputPortVariable
  const outputPortId = outputVar.id

  // 写入日志
  // writeLog(
  //   context,
  //   node.id,
  //   outputPortId,
  //   inputValue,
  // )

  // 输出为 HumanMessage
  return {
    [outputPortId]: inputValue,
  }
}
