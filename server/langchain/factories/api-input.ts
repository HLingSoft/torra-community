import type { APIInputData } from '@/types/node-data/api-input'
import type {
    BuildContext,
    FlowNode,


} from '~/types/workflow'
import { writeLog } from '../resolveInput'

// import { HumanMessage } from '@langchain/core/messages'

export async function apiInputFactory(node: FlowNode, context: BuildContext) {

    const { inputValue, structuredOutputVariable } = node.data as APIInputData
    // console.log('apiInputFactory', JSON.stringify(inputValue))
    writeLog(context, node.id, structuredOutputVariable.id, JSON.stringify(inputValue))



    return {
        [structuredOutputVariable.id]: inputValue,



    }
}
