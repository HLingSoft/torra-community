import type { TimezoneData } from '@/types/node-data/timezone'
import type { BuildContext, LangFlowNode, NodeFactory } from '~/types/workflow'
import { HumanMessage } from '@langchain/core/messages'
import { DateTime } from 'luxon'
import { writeLog } from '../resolveInput'

/**
 * Timezone 节点工厂函数
 */
export const timezoneFactory: NodeFactory = async (
  node: LangFlowNode,
  context: BuildContext
) => {
  const { timezone, outputVariable } = node.data as TimezoneData

  const now = DateTime.now().setZone(timezone)
  const formattedTime = now.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')

  // 写入日志，仅调试用途
  // writeLog(
  //   context,
  //   node.id,
  //   outputVariable.id,
  //   `Current time in ${timezone}: ${formattedTime}`
  // )

  // 返回端口输出（保持原逻辑）
  return {
    [outputVariable.id]: `Current time in ${timezone}: ${formattedTime}`,
  }
}
