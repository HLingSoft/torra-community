import type { APIInputData } from '@/types/node-data/api-input'
import type {
    BuildContext,
    FlowNode,


} from '~/types/workflow'
 
// import { HumanMessage } from '@langchain/core/messages'

export async function apiInputFactory(node: FlowNode, context: BuildContext) {
 
    const { inputValue, structuredOutputVariable, extraDataVariable } = node.data as APIInputData
    console.log('apiInputFactory', JSON.stringify(inputValue))
    
     
    return {
        [structuredOutputVariable.id]: inputValue
        // [extraDataVariable.id]:new  HumanMessage(extraDataVariable.value),
      
        
    }
}
