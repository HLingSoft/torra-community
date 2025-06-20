import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable
} from '~/types/workflow'
import type { DataToMessageData } from '@/types/node-data/data-to-message'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
/**
 * MessageToData 节点工厂函数
 */
export const dataToMessageFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const { inputInputVariable, outputVariable, role } = node.data as DataToMessageData

    const variableDefs = [inputInputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
    const message = inputValues[inputInputVariable.id]

    let storedMessage: HumanMessage | AIMessage | undefined = undefined;



    if (role === 'Human') {
        storedMessage = new HumanMessage(message)

    } else if (role === 'System') {
        storedMessage = new SystemMessage(message)


    } else if (role === 'AI') {
        storedMessage = new AIMessage(message)

    }



    return {
        [outputVariable.id]: storedMessage
    }
}
