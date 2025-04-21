import type { TextInputData } from '@/types/node-data/text-input'
import type { BuildContext, FlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { HumanMessage } from '@langchain/core/messages'
import { resolveInputVariables } from '../../langchain/resolveInput'
// 路径按你项目结构调整
export const textInputFactory: NodeFactory = async (node: FlowNode, context: BuildContext) => {
  const data = node.data as TextInputData
  const variableDefs = [data.inputVariable] as InputPortVariable[]
  const variableNames = variableDefs.map(v => v.name)

  const inputValues = await resolveInputVariables(context, variableDefs)

  const outputVar = data.outputVariable as OutputPortVariable

  // 如果没有定义 outputVariable.id，可以给个默认值
  const outputPortId = outputVar.id
  // console.log(`[TextInput] 变量:`, outputPortId,inputValues[variableNames[0]])
  return {
    // 端口1: 提供可执行 chain(最终会返回 Message)
    [outputPortId]: new HumanMessage(inputValues[variableNames[0]]),
  }

  // return {
  //   // LangChain Runnable 接口：有个 invoke() 方法
  //   invoke: async () => {
  //     // input.message 就是执行器里给的用户输入文本
  //     const userMessage = new HumanMessage(inputValues[variableNames[0]])
  //     console.log(`[DEBUG] TextInput node.invoke:`, userMessage)

  //     // 以 "端口ID" 为 key 返回一个对象
  //     // 这样 build.ts 里 results[node.id] 就能是 { [outputPortId]: HumanMessage(...) }
  //     return {
  //       [outputPortId]: userMessage,
  //     }
  //   },
  // }
}
