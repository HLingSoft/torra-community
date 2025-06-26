import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { APIInputData } from '@/types/node-data/api-input'
import { writeLogs } from '../utils'

export async function apiInputFactory(node: LangFlowNode, context: BuildContext) {
    const data = node.data as APIInputData
    const inputValue = data.inputValue
    writeLogs(context, node.id, data.title, data.type, {
        [data.structuredOutputVariable.id]: {
            content: inputValue,
            outputPort: data.structuredOutputVariable,
            elapsed: 0, // 这里可以设置为实际耗时
        }
    }, 0)

    return {
        [data.structuredOutputVariable.id]: inputValue,
    }
}
