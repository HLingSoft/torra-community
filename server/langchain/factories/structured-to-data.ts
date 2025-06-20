import type { StructuredToDataData } from '@/types/node-data/structured-to-data'
import type { BuildContext, LangFlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~/types/workflow'


import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'


export const structuredToDataFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const data = node.data as StructuredToDataData


    // 统一解析所有输入端口
    const inputValues = await resolveInputVariables(context, [data.structuredDataInputVariable])
    const inputValue = inputValues[data.structuredDataInputVariable.id] as string
    const outputVar = data.outputVariable as OutputPortVariable
    const outputPortId = outputVar.id
    // 如果已经是字符串就直接用，否则转字符串
    const outputStr = typeof inputValue === "string" ? inputValue : JSON.stringify(inputValue)

    // 写入日志
    // writeLog(
    //     context,
    //     node.id,
    //     outputPortId,
    //     inputValue,
    // )


    return {
        [outputPortId]: outputStr,
    }
}
