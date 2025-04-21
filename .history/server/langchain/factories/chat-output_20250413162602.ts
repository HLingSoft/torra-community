import type { ChatOutputData } from '@/types/node-data/chat-output'
import type { BuildContext, FlowNode, InputPortVariable, OutputPortVariable } from '~/types/workflow'

import { AIMessage } from '@langchain/core/messages'
// import { RunnableLambda } from '@langchain/core/runnables'
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function chatOutputFactory(node: FlowNode, context: BuildContext) {
  const {
    inputVariable,
  } = node.data as ChatOutputData
  console.log('🔗 [ChatOutput] 变量:', inputVariable)
  // 强转一下 data 以便获取 outputVariable
  const data = node.data as ChatOutputData
  const outputVar = data.outputVariable as OutputPortVariable

  // 如果没有定义 outputVariable.id，可以给个默认值
  const outputPortId = outputVar.id
  const variableDefs = [inputVariable] as InputPortVariable[]
  const variableNames = variableDefs.map(v => v.name)
  console.log('🔗 [ChatOutput] 变量:', variableNames)

  const inputValues = await resolveInputVariables(context, variableDefs)
  console.log('✅ ChatOutput 输入变量:', inputValues)
  return {
    // 端口1: 提供可执行 chain(最终会返回 Message)
    [outputPortId]: new AIMessage(inputValues[variableNames[0]]),
  }
}
