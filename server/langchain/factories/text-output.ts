import type { TextOutputData } from '@/types/node-data/text-output'
import type { BuildContext, LangFlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

/**
 * TextOutput 节点工厂函数
 */
export const textOutputFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const data = node.data as TextOutputData


  // 统一解析输入
  const inputValues = await resolveInputVariables(context, [data.messageInputVariable])
  const inputValue = inputValues[data.messageInputVariable.id] as string
  const outputVar = data.outputVariable as OutputPortVariable
  const outputPortId = outputVar.id

  // 写日志
  // writeLog(
  //   context,
  //   node.id,
  //   outputPortId,
  //   inputValue
  // )

  // console.log('TextOutputFactory inputValue:', inputValue)

  return {
    [outputPortId]: inputValue,
    default: inputValue,
  }
}
