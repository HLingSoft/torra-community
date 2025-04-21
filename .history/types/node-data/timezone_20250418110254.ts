import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface TimezoneData {
  title: string
  type: string
  icon?: string
  description: string
  inputVariable: InputPortVariable
  outputVariable: OutputPortVariable
  timezone: string
  location?: string
  show: boolean
  saved: boolean
}
