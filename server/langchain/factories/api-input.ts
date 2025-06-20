import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { APIInputData } from '@/types/node-data/api-input'


export async function apiInputFactory(node: LangFlowNode, context: BuildContext) {
    /* ---------- 1. 直接读取输入值 ---------- */
    const data = node.data as APIInputData
    const inputValue = data.inputValue


    return {
        [data.structuredOutputVariable.id]: inputValue,
    }
}
