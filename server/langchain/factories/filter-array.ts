import type { FilterArray } from '~~/types/node-data/filter-array'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable,
} from '~~/types/workflow'

import {
    resolveInputVariables,
    writeLogs
} from '../utils'

/** FilterArray 节点工厂函数 */
export async function filterArrayFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    try {
        const t0 = performance.now()
        const data = node.data as FilterArray
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
            } catch {
                inputObj = {}
            }
        } else {
            inputObj = {}
        }

        result = inputObj?.[filterKey] as any[]
        // console.log('Filter Array Result:', filterKey, result)

        const elapsed = performance.now() - t0
        // ✅ 写入结构化日志
        writeLogs(context, node.id, node.data.title, node.data.type, {
            [outputVariable.id]: {
                content: {
                    input: inputRaw,
                    filterKey,
                    result,
                },
                outputPort: outputVariable,
                elapsed,
            }
        }, elapsed)

        return {
            [outputVariable.id]: result
        }
    } catch (error: any) {
        console.error(`FilterArray node ${node.id} error:`, error)
        throw new Error(`FilterArray 节点执行失败: ${error.message}`)
    }

}
