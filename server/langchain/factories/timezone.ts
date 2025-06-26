import type { TimezoneData } from '@/types/node-data/timezone'
import type { BuildContext, LangFlowNode, NodeFactory } from '~/types/workflow'

import { DateTime } from 'luxon'
import { writeLogs } from '../utils'

/**
 * Timezone 节点工厂函数
 */
export const timezoneFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const t0 = performance.now()
  const { timezone, outputVariable } = node.data as TimezoneData

  const now = DateTime.now().setZone(timezone)
  const formattedTime = now.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')
  const elapsed = performance.now() - t0
  // 写入日志 
  writeLogs(context, node.id, node.data.title, node.data.type, {
    [outputVariable.id]: {
      content: formattedTime,
      outputPort: outputVariable,
      elapsed, // 这里可以计算实际耗时
    },
  }, elapsed)


  // 返回端口输出（保持原逻辑）
  return {
    [outputVariable.id]: `Current time in ${timezone}: ${formattedTime}`,
  }
}
