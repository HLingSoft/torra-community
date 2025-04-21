import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { UpstashRedisChatMemoryData } from '~/types/node-data/memory-redis'
import { resolveInputVariables } from '../resolveInput'
// import { RedisChatMessageHistory } from '@langchain/redis'
import { UpstashRedisChatMessageHistory } from '@langchain/community/stores/message/upstash_redis'
import { Redis } from "@upstash/redis";

//针对使用@upstash/redis的情况
export async function upstashRedisChatMemoryFactory(node: FlowNode, context: BuildContext) {
    const data = node.data as UpstashRedisChatMemoryData
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

    // console.log('upstashRedisChatMemoryFactory', url, token, sessionId)


    const memory = new UpstashRedisChatMessageHistory({
        sessionId,
        sessionTTL: 300,
        client: new Redis({
            url,
            token
        })
    })
    // try{
    //     // 测试连接
    //     console.log('upstashRedisChatMemoryFactory',await memory.getMessages())
      
    // }catch(e){
    //     console.error('upstashRedisChatMemoryFactory',e)
    //     throw new Error('[upstashRedisChatMemoryFactory] RedisChatMessageHistory 初始化失败')
    // }
   


    return {
        [memoryOutputVariable.id]: memory,
    }
}
