import type { OutputPortVariable } from '~/types/workflow'

export interface FilterDataData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  description: string // 节点描述
  inputValue: string // 用户输入的值
  outputVariable: OutputPortVariable
  show?: boolean // 控制 UI 展示
  saved?: boolean // 是否保存
}

export const  FilterDataLangchainName = 'FilterDataData' // 节点类型

export const filterDataMeta: FilterDataData = {
  icon: '💬',
  title: 'Filter Data',
  description: 'Filters data based on a condition.',
  type: FilterDataLangchainName,
  inputValue: '',
  outputVariable: {
    outputType: 'ID',
    name: 'output',
  } as OutputPortVariable,
  show: true,
}
