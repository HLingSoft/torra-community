import type { OutputPortVariable } from '~/types/workflow'

export interface ChatInputData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  dynamicValue: boolean // 是否动态节点
  description: string // 节点描述
  inputValue: string // 用户输入的值
  outputVariable: OutputPortVariable
  show?: boolean // 控制 UI 展示
  saved?: boolean // 是否保存
}

export const ChatInputLangchainName = 'ChatInput' // 节点类型

export const chatInputMeta: ChatInputData = {
  icon: '💬',
  title: 'Chat Input',
  description: 'Get chat inputs from the Playground.',
  type: ChatInputLangchainName,
  dynamicValue: true,
  inputValue: '',
  outputVariable: {
    outputType: 'Message',
    name: 'output',
  } as OutputPortVariable,
  show: true,
}
