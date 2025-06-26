import type { DataToStructuredData } from '@/types/node-data/data-to-structured'
import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    OutputPortVariable
} from '~/types/workflow'

import { resolveInputVariables, writeLogs } from '../utils'

export const dataToStructuredFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const data = node.data as DataToStructuredData

    const inputValues = await resolveInputVariables(context, [data.dataInputVariable])
    const inputValue = inputValues[data.dataInputVariable.id]
    const outputVar = data.structuredDataOutputVariable as OutputPortVariable
    const outputPortId = outputVar.id

    // 自动 JSON.parse 支持 object/array
    let output: any = inputValue
    if (typeof inputValue === 'string') {
        try {
            const parsed = JSON.parse(inputValue)
            if (typeof parsed === 'object' && parsed !== null) {
                output = parsed
            }
        } catch {
            output = inputValue
        }
    }

    // ✅ 写入结构化日志
    writeLogs(context, node.id, node.data.title, node.data.type, {
        [outputPortId]: {
            content: output,
            outputPort: outputVar,
            elapsed: 0,
        }
    }, 0)

    return {
        [outputPortId]: output,
    }
}
