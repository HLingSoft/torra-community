import { resolveInputVariables, writeLogs } from '../utils'
import type { CombineDataData } from '@/types/node-data/combine-data'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable,
} from '~/types/workflow'

/**
 * 组合数据工厂函数（立即执行）
 */
export async function combineDataFactory(
    node: LangFlowNode,
    context: BuildContext
) {

    // ✅ 计时开始
    const t0 = performance.now()

    const data = node.data as CombineDataData
    const {
        dataInputsInputVariable,
        operationType,
        outputVariable
    } = data

    const variableDefs: InputPortVariable[] = [dataInputsInputVariable]
    const inputValues = await resolveInputVariables(context, variableDefs)
    const inputValue = inputValues[dataInputsInputVariable.id] as any[]
    const outputPortId = outputVariable.id

    // ✅ 执行数据组合逻辑
    let result: any
    switch (operationType) {
        case 'append':
        case 'concatenate':
            result = Array.isArray(inputValue)
                ? inputValue.flat()
                : [inputValue]
            break
        case 'merge':
            result = Array.isArray(inputValue)
                ? inputValue.reduce((acc, item) => ({ ...acc, ...item }), {})
                : inputValue
            break
        case 'join':
            result = Array.isArray(inputValue)
                ? inputValue.join('\n')
                : String(inputValue)
            break
        default:
            result = inputValue
    }

    // ✅ 计时结束
    const elapsed = performance.now() - t0
    // ✅ 写入结构化日志
    writeLogs(context, node.id, data.title, data.type, {
        [outputPortId]: {
            content: {
                type: 'combine-data',
                operation: operationType,
                data: result,
            },
            outputPort: outputVariable,
            elapsed,
        }
    }, elapsed)

    // ✅ 返回执行结果
    return {
        [outputPortId]: result
    }
}
