import type { PromptTemplateData } from '@/types/node-data/prompt-template'
import type {
  BuildContext,
  LangFlowNode,
  InputPortVariable,
} from '~/types/workflow'

import { PromptTemplate } from '@langchain/core/prompts'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

/**
 * PromptTemplate 节点工厂函数
 * @param node - LangFlowNode 类型节点
 * @param context - DAG 运行上下文
 */
export async function promptTemplateFactory(node: LangFlowNode, context: BuildContext) {
  const data = node.data as PromptTemplateData
  // console.log('PromptTemplate 节点数据:', node.id)
  // 取出所有输入变量定义
  const variableDefs = data.inputVariables as InputPortVariable[] || []
  // console.log('PromptTemplate 节点变量定义:', variableDefs)
  // 提取所有变量名（模板参数名）
  const variableNames = variableDefs.map(v => v.name)
  // 实际解析得到变量值
  const inputValuesWithId = await resolveInputVariables(context, variableDefs)
  const inputValuesWithName = Object.fromEntries(
    Object.entries(inputValuesWithId).map(([id, value]) => {
      const variable = variableDefs.find(v => v.id === id)
      return [variable?.name || id, value]
    })
  )
  // console.log('解析得到的输入变量值:', inputValuesWithName)
  // 生成 PromptTemplate，并做参数 partial
  // const runnablePrompt = await new PromptTemplate({
  //   template: data.template,
  //   inputVariables: variableNames,
  // }).partial(inputValuesWithName)


  // // 格式化为最终文本
  // const finalPrompt = await runnablePrompt.format({})
  // 构造 PromptTemplate
  const promptTemplate = new PromptTemplate({
    template: data.template,
    inputVariables: variableNames,
  });
  // 部分变量 partial
  const runnablePrompt = await promptTemplate.partial(inputValuesWithName);
  // 关键：用 .invoke({})，而不是 .format({})
  const finalPrompt = await runnablePrompt.invoke({});
  // console.log('最终生成的 Prompt:', finalPrompt.value)


  // 输出端口 id
  const outputPortId = data.outputVariable.id

  // 写入日志（记录本次 prompt 最终内容）
  // writeLog(
  //   context,
  //   node.id,
  //   outputPortId,
  //   finalPrompt,
  // )

  // 按端口返回
  return {
    [outputPortId]: finalPrompt.value,
    [data.promptOutputVariable.id]: runnablePrompt,


  }
}
