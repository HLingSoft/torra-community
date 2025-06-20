import type { PassData } from '@/types/node-data/pass'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

/**
 * Pass 节点工厂函数
 */
export const passFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const data = node.data as PassData


    // 统一解析所有输入端口
    const inputValues = await resolveInputVariables(context, [data.inputInputVariable])
    const inputValue = inputValues[data.inputInputVariable.id] as string
    const outputVar = data.outputVariable as OutputPortVariable
    const outputPortId = outputVar.id

    // 写入日志
    // writeLog(
    //     context,
    //     node.id,
    //     outputPortId,
    //     inputValue,
    // )

    // 输出为 HumanMessage
    return {
        [outputPortId]: inputValue,
    }
}
