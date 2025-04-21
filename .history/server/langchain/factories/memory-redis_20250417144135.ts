import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { RedisChatMemoryData } from '~/types/node-data/memory-redis'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { RedisChatMessageHistory } from '@langchain/redis'
import { Redis } from "@upstash/redis";
export async function redisChatMemoryFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as RedisChatMemoryData
  const {
    hostnameVariable,
    portVariable,
    databaseVariable,
    memoryOutputVariable,
    sessionId,
  } = data

  const variableDefs = [
    hostnameVariable,
    portVariable,
    databaseVariable,
    
  ] as InputPortVariable[]

  const inputValues = await resolveInputVariables(context, variableDefs)

  const hostname = inputValues[hostnameVariable.name]
  const port = inputValues[portVariable.name]
  const db = inputValues[databaseVariable.name]
  

  const url = `redis://${hostname}:${port}/${db}`
//   redis[s]://[[username][:password]@][host][:port][/db-number]
  const memory = new RedisChatMessageHistory({
    sessionId,
    sessionTTL: 300,
    client:new Redis({
        url: 'https://fluent-dodo-23157.upstash.io',
        token:"AVp1AAIjcDE4YTM3ZjA5NjMzNTc0MDVmODIzZmViZDM3NzMxYTg5MXAxMA"
    })
  })

  return {
    [memoryOutputVariable.id]: memory,
  }
}
