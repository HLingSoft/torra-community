import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { RedisChatMemoryData } from '~/types/node-data/redis-chat-memory'
import { resolveInputVariables } from '../../langchain/resolveInput'

import { RedisChatMessageHistory } from '@langchain/redis/RedisChatMessageHistory'

export async function redisChatMemoryFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as RedisChatMemoryData
  const {
    hostnameVariable,
    portVariable,
    databaseVariable,
    sessionIdVariable,
    memoryOutputVariable,
  } = data

  const variableDefs = [
    hostnameVariable,
    portVariable,
    databaseVariable,
    sessionIdVariable,
  ] as InputPortVariable[]

  const inputValues = await resolveInputVariables(context, variableDefs)

  const hostname = inputValues[hostnameVariable.name]
  const port = inputValues[portVariable.name]
  const db = inputValues[databaseVariable.name]
  const sessionId = inputValues[sessionIdVariable.name]

  const url = `redis://${hostname}:${port}/${db}`

  const memory = new RedisChatMessageHistory({
    sessionId,
    url,
  })

  return {
    [memoryOutputVariable.id]: memory,
  }
}
