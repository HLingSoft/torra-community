import type { StructuredToDataData } from '~~/types/node-data/structured-to-data'
import type { BuildContext, LangFlowNode, InputPortVariable, NodeFactory, OutputPortVariable } from '~~/types/workflow'


import { resolveInputVariables, writeLogs } from '../utils'


export const structuredToDataFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const t0 = performance.now()
    const data = node.data as StructuredToDataData


    // 统一解析所有输入端口
    const inputValues = await resolveInputVariables(context, [data.structuredDataInputVariable])
    const inputValue = inputValues[data.structuredDataInputVariable.id]
    const outputVar = data.outputVariable as OutputPortVariable
    const outputPortId = outputVar.id
    // 如果已经是字符串就直接用，否则转字符串
    const outputStr = JSON.stringify(inputValue, null, 2)
    // console.log(
    //     `🔄 StructuredToData node ${node.id} outputStr:`,
    //     JSON.stringify(outputStr, null, 2)
    // )
    // console.log(`🔄 StructuredToData node ${node.id} inputValue:`, JSON.stringify(inputValue, null, 2))
    const elapsed = performance.now() - t0
    writeLogs(context, node.id, node.data.title, node.data.type, {
        [outputPortId]: {
            content: outputStr,
            outputPort: data.outputVariable,
            elapsed, // 这里可以计算实际耗时
        },
    }, elapsed)


    return {
        [outputPortId]: outputStr
    }
}
