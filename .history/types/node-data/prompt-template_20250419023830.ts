import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface PromptTemplateData {
  title: string
  description: string
  template: string
  type: string // 节点类型
  inputVariables: InputPortVariable[]
  outputVariable: OutputPortVariable
  show?: boolean
  saved?: boolean
}

export const PromptTemplateLangchainName = 'PromptTemplate' // 节点类型
export const promptTemplateMeta: PromptTemplateData = {
  type: PromptTemplateLangchainName,
  title: 'Prompt Template',
  description: 'Define your prompt with variables',
  template: '',
  inputVariables: [] as InputPortVariable[],
  outputVariable: {
    name: 'output',
    outputType: 'Prompt Message',
  } as OutputPortVariable,
  show: true,
}
