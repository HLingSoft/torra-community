import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface PromptTemplateData {
  icon: string // 图标
  title: string
  description: string
  template: string
  type: string // 节点类型
  inputVariables: InputPortVariable[]
  outputVariable: OutputPortVariable
  promptOutputVariable: OutputPortVariable // 可选的输出变量
  show?: boolean
  saved?: boolean
}

export const PromptTemplateLangchainName = 'PromptTemplate' // 节点类型
export const promptTemplateMeta: PromptTemplateData = {
  icon: 'humbleicons:prompt',
  type: PromptTemplateLangchainName,
  title: 'Prompt Template',
  description: 'Define your prompt with variables',
  template: '',
  inputVariables: [] as InputPortVariable[],
  outputVariable: {
    name: 'Return Formatted Prompt',
    outputType: 'Data',
  } as OutputPortVariable,
  promptOutputVariable: {
    name: 'Return Prompt Template',
    outputType: 'Prompt Template',
  } as OutputPortVariable,
  show: true,
}
