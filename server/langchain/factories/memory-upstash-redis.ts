import type { LangFlowNode, BuildContext, InputPortVariable } from '~/types/workflow'
import type { UpstashRedisChatMemoryData } from '@/types/node-data/memory-redis'
import { resolveInputVariables, writeLogs } from '../utils'
import { UpstashRedisChatMessageHistory } from '@langchain/community/stores/message/upstash_redis'
import { Redis } from "@upstash/redis"

export async function upstashRedisChatMemoryFactory(node: LangFlowNode, context: BuildContext) {
    const t0 = performance.now()
    const data = node.data as UpstashRedisChatMemoryData
    const {
        urlInputVariable,
        tokenInputVariable,
        memoryOutputVariable,
        sessionIdInputVariable
    } = data

    const variableDefs = [
        urlInputVariable,
        tokenInputVariable,
        sessionIdInputVariable
    ] as InputPortVariable[]

    const inputValues = await resolveInputVariables(context, variableDefs)
    const url = inputValues[urlInputVariable.id]
    const token = inputValues[tokenInputVariable.id]
    let sessionId = inputValues[sessionIdInputVariable.id]

    if (!sessionId) {
        sessionId = Date.now().toString()
    }

    const memory = new UpstashRedisChatMessageHistory({
        sessionId,
        client: new Redis({ url, token })
    })

    const elapsed = performance.now() - t0
    // ✅ 结构化日志
    writeLogs(
        context,
        node.id,
        data.title,
        data.type,
        {
            [memoryOutputVariable.id]: {
                content: {
                    url,
                    token: token ? '***' : '',
                    sessionId
                },
                outputPort: memoryOutputVariable,
                elapsed
            }
        },
        elapsed
    )

    return {
        [memoryOutputVariable.id]: memory
    }
}
