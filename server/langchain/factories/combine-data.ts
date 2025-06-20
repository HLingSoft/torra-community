import { RunnableLambda } from "@langchain/core/runnables"
import {
    resolveInputVariables,
    writeLog,
    wrapRunnable
} from '../../langchain/resolveInput'
import type { CombineDataData } from '@/types/node-data/combine-data'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable,
} from '~/types/workflow'

/**  
 * 组合数据。可能返回字符串、也可能是数组、也可能是对象
| operationType      | 返回类型 | 说明                            |
| ------------------ | ---- | ----------------------------- |
| append/concatenate | 数组   | 展平数组，比如 `[1,[2,3]]`→`[1,2,3]` |
| merge              | 对象   | 浅合并对象                         |
| join               | 字符串  | 把数组变成字符串，`\n` 拼接              |
| 其它/default         | 任意   | 输入原样输出                        |
 */
export async function combineDataFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const data = node.data as CombineDataData
    const {
        dataInputsInputVariable,
        operationType, // append/merge/concatenate/join
        outputVariable
    } = data

    const variableDefs: InputPortVariable[] = [dataInputsInputVariable]

    const inputValues = await resolveInputVariables(context, variableDefs)
    const inputValue = inputValues[dataInputsInputVariable.id] as any[]
    const outputPortId = outputVariable.id

    // 封装成 runnable
    const combineChain = RunnableLambda.from(async () => {
        let result: any
        switch (operationType) {
            case 'append':
            case 'concatenate':
                // 展平嵌套数组并拼接
                result = Array.isArray(inputValue)
                    ? inputValue.flat()
                    : [inputValue]
                break
            case 'merge':
                // 合并对象，浅合并
                if (Array.isArray(inputValue)) {
                    result = inputValue.reduce((acc, item) => ({ ...acc, ...item }), {})
                } else {
                    result = inputValue
                }
                break
            case 'join':
                // 将数组内容用换行或逗号拼接成字符串
                if (Array.isArray(inputValue)) {
                    result = inputValue.join('\n')
                } else {
                    result = String(inputValue)
                }
                break
            default:
                // 默认直接输出
                result = inputValue
        }

        // 日志
        // writeLog(context, node.id, outputPortId, result)

        return result
    })

    // 用 wrapRunnable 包裹
    const wrapped = wrapRunnable(
        combineChain,
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: outputPortId,
            logFormat: res => ({
                type: "combine-data",
                operation: operationType,
                data: res
            })
        }
    )

    return {
        [outputPortId]: wrapped,

    }
}
