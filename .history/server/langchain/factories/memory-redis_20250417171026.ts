import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { RedisChatMemoryData } from '~/types/node-data/memory-redis'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { RedisChatMessageHistory } from '@langchain/redis'
import { Redis } from "@upstash/redis";

//针对使用@upstash/redis的情况
export async function redisChatMemoryFactory(node: FlowNode, context: BuildContext) {
    const data = node.data as RedisChatMemoryData
    const {
        urlVariable,
        tokenVariable,
        memoryOutputVariable,
        sessionId,
    } = data

    const variableDefs = [
        urlVariable,
        tokenVariable

    ] as InputPortVariable[]

    const inputValues = await resolveInputVariables(context, variableDefs)
    const url = inputValues[urlVariable.name]
    const token = inputValues[tokenVariable.name]

    console.log('redisChatMemoryFactory', url, token, sessionId)


    const memory = new RedisChatMessageHistory({
        sessionId,
        sessionTTL: 300,
        client: new Redis({
            url,
            token
        })
    })
    memory.ensureReadiness()
    console.log('redisChatMemoryFactory', memory)


    return {
        [memoryOutputVariable.id]: memory,
    }
}
