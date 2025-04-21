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

export const TimezoneLangchainName = 'Timezone'

export const timezoneMeta: TimezoneData = {
    title: 'Current Date',
    description: 'Returns the current date and time in the selected timezone.',
    type: TimezoneLangchainName,
    icon: 'mdi:clock-outline', // 你可以替换成实际图标库里的图标名称
    
    outputVariable: {
      name: 'currentDate',
      outputType: 'Message',
    } as OutputPortVariable,
    timezone: 'UTC',
    location: '',
    show: true,
    saved: false,
  }
