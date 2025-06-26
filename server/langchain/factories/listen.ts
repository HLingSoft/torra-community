import type { ListenData } from '@/types/node-data/listen'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { resolveInputVariables, writeLogs } from '../utils'
import { createRedisClient } from '~/server/utils/redis'

/**
 * Listen 节点工厂函数（Redis版）
 */
export const listenFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const data = node.data as ListenData
    const inputValues = await resolveInputVariables(context, [data.nameInputVariable])
    const listenName = inputValues[data.nameInputVariable.id] as string
    const outputVar = data.outputVariable as OutputPortVariable
    const outputPortId = outputVar.id

    if (!listenName) {
        throw new Error('Listen node requires a valid name to listen for events.')
    }

    const channel = `id: ${data.nameInputVariable.id}: listen: ${listenName}`
    const redisSub = createRedisClient()
    const TIMEOUT_MS = 600 * 1000 // 600秒

    const t0 = performance.now()

    return new Promise((resolve, reject) => {
        const handler = (chan: string, message: string) => {
            if (chan === channel) {
                let eventData: any = message
                try {
                    eventData = JSON.parse(message)
                } catch (e) { }

                clearTimeout(timeout)
                redisSub.unsubscribe(channel)
                redisSub.removeListener('message', handler)
                redisSub.quit()

                const elapsed = performance.now() - t0

                // ✅ 写入日志
                writeLogs(context, node.id, data.title, data.type, {
                    [outputPortId]: {
                        content: eventData,
                        outputPort: outputVar,
                        elapsed,
                    },
                }, elapsed)

                resolve({ [outputPortId]: eventData })
            }
        }

        redisSub.subscribe(channel, (err) => {
            if (err) {
                clearTimeout(timeout)
                redisSub.removeListener('message', handler)
                redisSub.quit()
                reject(err)
                return
            }
            redisSub.on('message', handler)
        })

        const timeout = setTimeout(() => {
            redisSub.unsubscribe(channel)
            redisSub.removeListener('message', handler)
            redisSub.quit()
            reject(new Error(`Listen node timed out after ${TIMEOUT_MS / 1000} seconds waiting for [${listenName}]`))
        }, TIMEOUT_MS)
    })
}
