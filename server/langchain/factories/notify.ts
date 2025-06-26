import type { NotifyData } from '@/types/node-data/notify'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { resolveInputVariables, writeLogs } from '../utils'
import { createRedisClient } from '~/server/utils/redis'

export const notifyFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const data = node.data as any
    const inputValues = await resolveInputVariables(context, [data.nameInputVariable, data.valueInputVariable])
    const notifyName = inputValues[data.nameInputVariable.id] as string
    const notifyValue = inputValues[data.valueInputVariable.id]
    const append = data.append || false

    if (!notifyName) {
        throw new Error('Notify node requires a valid name to notify events.')
    }



    const channel = `id:${data.nameInputVariable.id}:listen:${notifyName}`
    const appendKey = `id: ${data.nameInputVariable.id}:notify:${notifyName}` // 用于存储 append 数据
    const redisPub = createRedisClient()

    // 写入数据（支持 append）
    if (append) {
        // 追加到 Redis List
        await redisPub.rpush(appendKey, JSON.stringify(notifyValue))
    } else {
        // 覆盖模式（可选，也可以不存储，只发事件）
        await redisPub.set(appendKey, JSON.stringify(notifyValue))
    }

    // 发布事件通知
    await redisPub.publish(channel, JSON.stringify(notifyValue))

    // 关闭连接
    redisPub.quit()

    // ✅ 写日志
    writeLogs(
        context,
        node.id,
        data.title,
        data.type,
        {
            [data.outputVariable.id]: {
                content: notifyValue,
                outputPort: data.outputVariable,
                elapsed: 0
            }
        },
        0
    )

    return {
        [data.outputVariable.id]: notifyValue
    }
}
