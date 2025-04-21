import type { StructuredOutputData } from '@/types/node-data/structured-output'
import type {
  BuildContext,
  FlowNode,
  InputPortVariable,

} from '~/types/workflow'

import { PromptTemplate } from '@langchain/core/prompts'

import { resolveInputVariables } from '../../langchain/resolveInput'

export async function structuredOutputFactory(node: FlowNode, context: BuildContext) {

  const data = node.data as StructuredOutputData
  // console.log('🔗 [PromptTemplate] 变量:',  context)
  const variableDefs = [data.inputMessageVariable] as InputPortVariable[]  
  

  const inputValues = await resolveInputVariables(context, variableDefs)

  // console.log('✅ PromptTemplate 输入变量:', inputValues)

  const runnablePrompt = await new PromptTemplate({
    template: data.template,
    inputVariables: variableNames,
  }).partial(inputValues)

  const finalPrompt = await runnablePrompt.format({})
  console.log('✅ PromptTemplate 最终格式化:', finalPrompt)

  // 👇 输出端口的 ID
  const outputPortId = data.outputVariable?.id || 'output'

  // 返回格式必须为 { [outputPortId]: ... }
  return {
    [outputPortId]: runnablePrompt,
  }
}
