import type { TimezoneData } from '@/types/node-data/timezone'
import type { FlowNode, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { HumanMessage } from '@langchain/core/messages'
import { DateTime } from 'luxon'  

export const timezoneFactory: NodeFactory = async (node: FlowNode) => {
  const data = node.data as TimezoneData

  const timezone = data.timezone || 'UTC'
  const now = DateTime.now().setZone(timezone)

  const formattedTime = now.toFormat("yyyy-MM-dd HH:mm:ss ZZZZ") // 输出格式

  const outputVar = data.outputVariable as OutputPortVariable
  const outputPortId = outputVar.id

  return {
    [outputPortId]: new HumanMessage(`Current time in ${timezone}: ${formattedTime}`),
  }
}
