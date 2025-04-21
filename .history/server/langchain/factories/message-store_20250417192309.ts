import type { BuildContext, FlowNode } from '~/types/workflow'
import type { AIMessage } from '@langchain/core/messages'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { MessageStoreData } from '@/types/node-data/message-store'
import { InputPortVariable } from '~/types/workflow'
 // 🧠 获取 memory 对象（通过上游连接）
const getMemory = async(context:BuildContext,memoryInputVariable:InputPortVariable) => {

   const edge = context.json.edges.find((e: any) => e.target === memoryInputVariable.id)
   if (!edge) throw new Error('[MessageHistory] memoryInputVariable 没有连接')
 
   const sourcePortId = edge.source
   const upstreamNodeId = context.json.nodes[sourcePortId]?.data?.parentNode
   const upstreamResult = context.results?.[upstreamNodeId]
    
   let rawMemory = upstreamResult?.[sourcePortId] ?? Object.values(upstreamResult || {})[0]
  
  
   // 如果是 Runnable（有 invoke）
   if (rawMemory && typeof rawMemory.invoke === 'function') {
     rawMemory = await rawMemory.invoke()
   }
   
   const memory =
     typeof rawMemory?.getMessages === 'function'
       ? rawMemory
       : rawMemory?.memory
   
   if (!memory || typeof memory.getMessages !== 'function') {
     throw new Error('[MessageHistory] memory 对象无效或不支持 getMessages()')
   }
    return memory
}

export async function messageStoreFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageStoreData
  const {
    messageInputVariable,
    memoryInputVariable,
    storedMessagesOutputVariable,
  } = data
  console.log('🔗 [MessageStore] 变量:', data)
  const inputValues = await resolveInputVariables(context, [messageInputVariable])
      const message = inputValues[messageInputVariable.name]
      console.log('[MessageStore] 变量:', message)
      if(message){
        const memory = await getMemory(context, memoryInputVariable)
        await memory.addMessage(message)
      }


  return {
    [storedMessagesOutputVariable.id]: new AIMessage(message),
  }
}
