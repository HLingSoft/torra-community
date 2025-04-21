import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'

export interface TimezoneData {
  title: string
  type: string
  icon?: string
  description: string
  outputVariable: OutputPortVariable
  timezone: string
  location?: string
  show: boolean
  saved: boolean
}
