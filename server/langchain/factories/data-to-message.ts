import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable
} from '~/types/workflow'
import type { DataToMessageData } from '@/types/node-data/data-to-message'
import { resolveInputVariables, writeLogs } from '../utils'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

/**
 * DataToMessage 节点工厂函数（立即执行 + 写日志）
 */
export const dataToMessageFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const { inputInputVariable, outputVariable, role } = node.data as DataToMessageData

    const variableDefs = [inputInputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
    const inputText = inputValues[inputInputVariable.id]

    let storedMessage

    switch (role) {
        case 'Human':
            storedMessage = new HumanMessage(inputText)
            break
        case 'System':
            storedMessage = new SystemMessage(inputText)
            break
        case 'AI':
            storedMessage = new AIMessage(inputText)
            break
        default:
            storedMessage = new HumanMessage(inputText)
    }

    // ✅ 写日志（elapsed 为 0）
    writeLogs(context, node.id, node.data.title, node.data.type, {
        [outputVariable.id]: {
            content: storedMessage,
            outputPort: outputVariable,
            elapsed: 0
        }
    }, 0)

    return {
        [outputVariable.id]: storedMessage
    }
}
