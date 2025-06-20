import type { OutputPortVariable } from '~/types/workflow'

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
  icon: 'stash:globe-timezone-duotone', // 你可以替换成实际图标库里的图标名称
  outputVariable: {
    name: 'When Done',
    outputType: 'Data',
  } as OutputPortVariable,
  timezone: 'UTC',
  location: '中国/上海',
  show: true,
  saved: false,
}
