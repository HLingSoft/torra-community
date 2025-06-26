import type { PromptTemplateData } from '@/types/node-data/prompt-template'
import type {
  BuildContext,
  LangFlowNode,
  InputPortVariable,
} from '~/types/workflow'

import { PromptTemplate } from '@langchain/core/prompts'
import { resolveInputVariables, writeLogs } from '../utils'

/**
 * PromptTemplate 节点工厂函数
 * @param node - LangFlowNode 类型节点
 * @param context - DAG 运行上下文
 */
export async function promptTemplateFactory(node: LangFlowNode, context: BuildContext) {
  const data = node.data as PromptTemplateData

  // 取出所有输入变量定义
  const variableDefs = data.inputVariables as InputPortVariable[] || []

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

  const promptTemplate = new PromptTemplate({
    template: data.template,
    inputVariables: variableNames,
  });
  // 部分变量 partial
  const runnablePrompt = await promptTemplate.partial(inputValuesWithName);

  const finalPrompt = await runnablePrompt.invoke({});



  // 输出端口 id
  const outputPortId = data.outputVariable.id

  writeLogs(
    context,
    node.id,
    data.title,
    data.type,
    {
      [outputPortId]: {
        content: finalPrompt.value,
        outputPort: data.outputVariable,
        elapsed: 0
      }
    },
    0
  )

  // 按端口返回
  return {
    [outputPortId]: finalPrompt.value,
    [data.promptOutputVariable.id]: runnablePrompt,


  }
}
