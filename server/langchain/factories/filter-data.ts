import type { FilterData } from '@/types/node-data/filter-data'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable,
} from '~/types/workflow'

import {
    resolveInputVariables,
    writeLog
} from '../../langchain/resolveInput'

/** FilterData 节点工厂函数 */
export async function filterDataFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const data = node.data as FilterData
    const {
        inputInputVariable,
        filterKeyInputVariable,
        outputVariable
    } = data

    const variableDefs: InputPortVariable[] = [
        inputInputVariable,
        filterKeyInputVariable
    ]


    const inputValues = await resolveInputVariables(context, variableDefs)


    const inputRaw = inputValues[inputInputVariable.id]
    const filterKey = inputValues[filterKeyInputVariable.id]

    let result: any
    let inputObj: any
    if (typeof inputRaw === 'object' && inputRaw !== null) {
        inputObj = inputRaw
    } else if (typeof inputRaw === 'string' && inputRaw.trim().startsWith('{')) {
        try {
            inputObj = JSON.parse(inputRaw)
        } catch (e) {
            inputObj = {}
        }
    } else {
        inputObj = {}
    }
    result = inputObj?.[filterKey]



    return {
        [outputVariable.id]: result
    }
}
