import type { PromptTemplateData } from '@/types/node-data/prompt-template'
import type {
  BuildContext,
  FlowNode,
  InputPortVariable,

} from '~/types/workflow'

import { PromptTemplate } from '@langchain/core/prompts'

import { resolveInputVariables } from '../../langchain/resolveInput'

export async function promptTemplateFactory(node: FlowNode, context: BuildContext) {

  const data = node.data as PromptTemplateData
  console.log('🔗 [PromptTemplate] 变量:', data,context)
  const variableDefs = data.inputVariables as InputPortVariable[] || []
  const variableNames = variableDefs.map(v => v.name)

  const inputValues = await resolveInputVariables(context, variableDefs)

  console.log('✅ PromptTemplate 输入变量:', inputValues)

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
