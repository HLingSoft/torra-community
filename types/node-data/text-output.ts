import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

export interface TextOutputData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  description: string // 节点描述
  messageInputVariable: InputPortVariable // 输入变量
  outputVariable: OutputPortVariable
  show?: boolean // 控制展示区域是否折叠
  saved?: boolean // 是否保存
}

export const TextOutputLangchainName = 'TextOutput' // 节点类型
export const textOutputMeta: TextOutputData = {
  type: TextOutputLangchainName,
  title: 'Text Output',
  icon: 'solar:text-square-2-line-duotone',
  description: 'Display a text message in the Playground.',
  messageInputVariable: {
    name: 'Input Data',
    allowedTypes: ['Data', 'Structured Data', 'Data[]'],
    value: '',

  } as InputPortVariable,

  outputVariable: {
    outputType: 'Data',
    name: 'When Done',
  } as OutputPortVariable,
  show: true,
}
