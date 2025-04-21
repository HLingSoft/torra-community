import type {
    BuildContext,
    FlowNode,
    NodeFactory,
    InputPortVariable,
 
  } from '~/types/workflow'
  import { AIMessage, ChatMessage, HumanMessage, type BaseMessage } from '@langchain/core/messages'
  import type { MessageToDataData } from '@/types/node-data/message-to-data'
  import { resolveInputVariables,normalizeToString } from '../../langchain/resolveInput'
  import { ChatPromptTemplate } from '@langchain/core/prompts'
  import { load } from '@langchain/core/load';
  import { getBufferString } from '@langchain/core/messages';
   
  export const messageToDataFactory: NodeFactory = async (
    node: FlowNode,
    context: BuildContext
  ) => {

 
    const {inputVariable,outputVariable} = node.data as MessageToDataData
  
    const variableDefs = [inputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
    console.log('messageToDataFactory:', inputValues)
    const result=normalizeToString( inputValues[ inputVariable.name])
     
  
    return {
      [outputVariable.id]: result ?? '',
    }
  }
  