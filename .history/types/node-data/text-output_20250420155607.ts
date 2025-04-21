import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface TextOutputData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  description: string // 节点描述
  inputVariable: InputPortVariable // 输入变量
  outputVariable: OutputPortVariable
  show?: boolean // 控制展示区域是否折叠
  saved?: boolean // 是否保存
}

export const TextOutputLangchainName = 'TextOutput' // 节点类型
export const textOutputMeta: TextOutputData = {
  type: TextOutputLangchainName,
  title: 'Text Output',
  icon: '📤',
  description: 'Display a text message in the Playground.',
  inputVariable: {
    name: 'input',
    allowedTypes: ['Message'],
    value: '',
  } as InputPortVariable,

  outputVariable: {
    outputType: 'Data',
    name: 'output',
  } as OutputPortVariable,
  show: true,
}
