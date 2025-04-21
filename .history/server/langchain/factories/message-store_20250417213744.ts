import type { BuildContext, FlowNode } from '~/types/workflow'
import  { AIMessage } from '@langchain/core/messages'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { MessageStoreData } from '@/types/node-data/message-store'
import { InputPortVariable } from '~/types/workflow'
import { UpstashRedisChatMessageHistory } from '@langchain/community/stores/message/upstash_redis'
 
export async function messageStoreFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageStoreData
  const {
    messageInputVariable,
    memoryInputVariable,
    storedMessagesOutputVariable,
  } = data
  // console.log('🔗 [MessageStore] 变量:', data)
      const inputValues = await resolveInputVariables(context, [messageInputVariable,memoryInputVariable])
      const memory = inputValues[memoryInputVariable.name] as any
      const message = inputValues[messageInputVariable.name]
      // console.log('🔗 [MessageStore] 变量:',  message,memory)
      // console.log('[MessageStore] 变量:', message)
      if(message ){
       
        await memory.addMessage(new AIMessage(message))
      }


  return {
    [storedMessagesOutputVariable.id]: new AIMessage(message),
  }
}
