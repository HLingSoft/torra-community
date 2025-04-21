import type { InputPortVariable,OutputPortVariable } from '~/types/workflow'

export interface FilterDataData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  description: string // 节点描述
  inputVariable: InputPortVariable // 输入变量
  filterKey: string // 过滤条件
  outputVariable: OutputPortVariable
  show?: boolean // 控制 UI 展示
  saved?: boolean // 是否保存
}

export const  FilterDataLangchainName = 'FilterDataData' // 节点类型

export const filterDataMeta: FilterDataData = {
  icon: '💬',
  title: 'Filter Data',
  description: 'Picks out the value for a specific key in the data.',
  type: FilterDataLangchainName,
  filterKey: '',
  inputVariable: {
    name: 'input',
    allowedTypes: ['Message'],
    value: '',
    forceStringify: true,
   } as InputPortVariable,
  outputVariable: {
    outputType: 'Message',
    name: 'output',
  } as OutputPortVariable,
  show: true,
}
