import type { OutputPortVariable } from '~~/types/workflow'

export interface IDGeneratorData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  description: string // 节点描述
  inputValue: string // 用户输入的值
  outputVariable: OutputPortVariable
  show?: boolean // 控制 UI 展示
  saved?: boolean // 是否保存
}

export const IDGeneratorLangchainName = 'IDGenerator' // 节点类型

export const iDGeneratorMeta: IDGeneratorData = {
  icon: 'solar:user-id-broken',
  title: 'ID Generator',
  description: 'Generates a unique ID.',
  type: IDGeneratorLangchainName,
  inputValue: '',
  outputVariable: {
    outputType: 'Data',
    name: 'When Done',
  } as OutputPortVariable,
  show: true,
}
