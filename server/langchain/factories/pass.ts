import type { PassData } from '@/types/node-data/pass'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~/types/workflow'

import { resolveInputVariables, writeLogs } from '../utils'

/**
 * Pass 节点工厂函数
 */
export const passFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const t0 = performance.now()
    const data = node.data as PassData


    // 统一解析所有输入端口
    const inputValues = await resolveInputVariables(context, [data.inputInputVariable])
    const inputValue = inputValues[data.inputInputVariable.id] as string
    const outputVar = data.outputVariable as OutputPortVariable
    const outputPortId = outputVar.id

    const elapsed = performance.now() - t0
    writeLogs(
        context,
        node.id,
        data.title,
        data.type,
        {
            [outputPortId]: {
                content: inputValue,
                outputPort: outputVar,
                elapsed
            }
        },
        elapsed
    )


    return {
        [outputPortId]: inputValue,
    }
}
