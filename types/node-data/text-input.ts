import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface TextInputData {
  title: string // 节点标题
  type: string // 节点类型
  icon?: string // 节点图标
  description: string // 节点描述
  inputInputVariable: InputPortVariable
  outputVariable: OutputPortVariable
  show: boolean // 控制 UI 展示
  saved: boolean // 是否保存
}
export const TextInputLangchainName = 'TextInput' // 节点类型
export const textInputMeta: TextInputData = {
  title: 'Text Input',
  description: 'Text input node',
  type: TextInputLangchainName,
  icon: 'solar:text-line-duotone',
  inputInputVariable: {
    name: 'Input',
    allowedTypes: ['Data'],
    value: '',

  } as InputPortVariable,
  outputVariable: {
    name: 'When Done',
    outputType: 'Data',
  } as OutputPortVariable,
  show: true,
  saved: false,
}
