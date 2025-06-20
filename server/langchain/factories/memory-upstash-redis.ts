import type { LangFlowNode, BuildContext, InputPortVariable } from '~/types/workflow'
import type { UpstashRedisChatMemoryData } from '@/types/node-data/memory-redis'
import { resolveInputVariables, writeLog } from '../resolveInput'
import { UpstashRedisChatMessageHistory } from '@langchain/community/stores/message/upstash_redis'
import { Redis } from "@upstash/redis"

/**
 * Upstash Redis Chat Memory 节点工厂函数
 */
export async function upstashRedisChatMemoryFactory(node: LangFlowNode, context: BuildContext) {
    const data = node.data as UpstashRedisChatMemoryData
    const {
        urlInputVariable,
        tokenInputVariable,
        memoryOutputVariable,
        sessionIdInputVariable
    } = data

    // 1. 解析输入变量
    const variableDefs = [
        urlInputVariable,
        tokenInputVariable,
        sessionIdInputVariable
    ] as InputPortVariable[]

    const inputValues = await resolveInputVariables(context, variableDefs)
    const url = inputValues[urlInputVariable.id]
    const token = inputValues[tokenInputVariable.id]
    let sessionId = inputValues[sessionIdInputVariable.id]

    // 2. 若 sessionId 为空则用当前时间戳
    if (!sessionId) {
        sessionId = Date.now().toString()
    }

    // 3. 创建 Upstash Redis Chat Memory 实例
    const memory = new UpstashRedisChatMessageHistory({
        sessionId,
        // sessionTTL: 3600, //永久
        client: new Redis({ url, token })
    })


    // 4. 返回端口映射
    return {
        [memoryOutputVariable.id]: memory
    }
}
