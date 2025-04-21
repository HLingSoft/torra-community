import type { OutputPortVariable ,InputPortVariable} from '~/types/workflow'

export interface IfElseData {
  type: string // 节点类型
  title: string // 节点标题
  icon?: string // 节点图标
  description: string // 节点描述
  textInputVariable:InputPortVariable // 输入变量
  matchTextVariable:InputPortVariable // 匹配文本变量
  operator: string // 操作符
  caseSensitive: boolean // 是否区分大小写
  messageVariable:InputPortVariable // 消息变量
  trueOutputVariable: OutputPortVariable
    falseOutputVariable: OutputPortVariable
  show?: boolean // 控制 UI 展示
  saved?: boolean // 是否保存
}

export const  IfElseDataLangchainName = 'IfElseData' // 节点类型

export const iDGeneratorMeta: IfElseData = {
  icon: '💬',
  title: 'If-Else',
  description: 'Routes an input message to a corresponding output based on text comparison.',
  type: IfElseDataLangchainName,
   
  trueOutputVariable: {
    outputType: 'True',
    name: 'output-true',
    value:true
  } as OutputPortVariable,
  falseOutputVariable: {
        outputType: 'False',
        name: 'output-false',
        value:false
    } as OutputPortVariable,
  show: true,
}
