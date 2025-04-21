import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow'
import type { RedisChatMemoryData } from '~/types/node-data/memory-redis'
import { resolveInputVariables } from '../../langchain/resolveInput'

import { RedisChatMessageHistory } from '@langchain/redis'

export async function redisChatMemoryFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as RedisChatMemoryData
  const {
    hostnameVariable,
    portVariable,
    databaseVariable,
   
    memoryOutputVariable,
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
  const sessionId =new Date().toISOString()

  const url = `redis://${hostname}:${port}/${db}`

  const memory = new RedisChatMessageHistory({
    sessionId,
    url,
  })

  return {
    [memoryOutputVariable.id]: memory,
  }
}
