import type { BuildContext, FlowNode } from '~/types/workflow'
import  { AIMessage, HumanMessage } from '@langchain/core/messages'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { MessageStoreData } from '@/types/node-data/message-store'
 
 
export async function messageStoreFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as MessageStoreData
  const {
    messageInputVariable,
    memoryInputVariable,
    role,
    storedMessagesOutputVariable,
  } = data
 
      const inputValues = await resolveInputVariables(context, [messageInputVariable,memoryInputVariable])
      const memory = inputValues[memoryInputVariable.name] as any
      const message = inputValues[messageInputVariable.name]
      console.log('messageStoreFactory',role,role === 'Human',message)
      // console.log('storedMessagesOutputVariable',storedMessagesOutputVariable.id)
      if(message ){
       
        if(role === 'Human'){
      
          await memory.addMessage(new HumanMessage(message))
        }else{
          await memory.addMessage(new AIMessage(message))
        }

       
      }


  return {
    [storedMessagesOutputVariable.id]: new AIMessage(message),
  }
}
