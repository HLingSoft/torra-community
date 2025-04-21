import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface ChatOutputData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  description: string // 节点描述
  inputVariable: InputPortVariable // 输入变量
  outputVariable: OutputPortVariable
  show?: boolean // 控制展示区域是否折叠
  saved?: boolean // 是否保存
}

export const ChatOutputLangchainName = 'ChatOutput' // 节点类型
export const chatOutputMeta: ChatOutputData = {
  type: ChatOutputLangchainName,
  title: 'Chat Output',
  icon: '📤',
  description: 'Display a chat message in the Playground.',
  inputVariable: {
    name: 'input',
    allowedTypes: ['Message'],
    value: '',
  } as InputPortVariable,

  outputVariable: {
    outputType: 'Message',
    name: 'output',
  } as OutputPortVariable,
  show: true,
}
