import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface MessageHistoryData {
  type: string
  title: string
  description: string
  icon?: string

  memoryInputVariable: InputPortVariable

  dataOutputVariable: OutputPortVariable
  messageOutputVariable: OutputPortVariable
  dataframeOutputVariable: OutputPortVariable
}
