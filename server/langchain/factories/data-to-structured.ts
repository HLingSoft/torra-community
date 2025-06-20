import type { DataToStructuredData } from '@/types/node-data/data-to-structured'
import type { BuildContext, LangFlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'


import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'
export const dataToStructuredFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const data = node.data as DataToStructuredData

    // 统一解析所有输入端口
    const inputValues = await resolveInputVariables(context, [data.dataInputVariable])
    const inputValue = inputValues[data.dataInputVariable.id]
    const outputVar = data.structuredDataOutputVariable as OutputPortVariable
    const outputPortId = outputVar.id

    // 自动 JSON.parse 支持 object/array
    let output: any = inputValue
    if (typeof inputValue === "string") {
        try {
            const parsed = JSON.parse(inputValue)
            // 只输出对象或数组，其他类型原样返回
            if (typeof parsed === "object" && parsed !== null) {
                output = parsed
            }
        } catch (e) {
            // 非法 JSON 直接输出原字符串
            output = inputValue
        }
    }


    return {
        [outputPortId]: output,
    }
}
