import type { TimezoneData } from '@/types/node-data/timezone'
import type { FlowNode, NodeFactory } from '~/types/workflow'

import { HumanMessage } from '@langchain/core/messages'
import { DateTime } from 'luxon'  

export const timezoneFactory: NodeFactory = async (node: FlowNode) => {
  const { timezone, outputVariable} = node.data as TimezoneData

//   const timezone = data.timezone || 'UTC'
  const now = DateTime.now().setZone(timezone)

  const formattedTime = now.toFormat("yyyy-MM-dd HH:mm:ss ZZZZ") // 输出格式
 

  return {
    [outputVariable.id]: new HumanMessage(`Current location is ${location} ,Current time in ${timezone}: ${formattedTime}`),
  }
}
