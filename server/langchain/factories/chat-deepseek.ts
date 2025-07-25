import type { ChatDeepSeekData } from '~~/types/node-data/chat-deepseek'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable
} from '~~/types/workflow'

import { ChatDeepSeek } from "@langchain/deepseek";
import {
    resolveInputVariables,
    isOutputPortConnected,
    writeLogs
} from '../utils'

import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'
import { SafeRunCollectorHandler } from '../safeRunCollectorHandler'

interface LanguageModel {
    model: ChatDeepSeek
    messages: BaseMessage[]
}

/** ChatDeepSeek 节点工厂函数 */
export async function chatDeepSeekFactory(
    node: LangFlowNode,
    context: BuildContext
) {

    try {
        const t0 = performance.now()
        const data = node.data as ChatDeepSeekData
        const {
            modelName,
            historyMessageInputVariable,
            temperature,
            streaming,
            inputTextInputVariable,
            systemMessageInputVariable,
            apiKeyInputVariable,

            messageOutputVariable,
            languageModelOutputVariable
        } = data

        const variableDefs: InputPortVariable[] = [
            inputTextInputVariable,
            systemMessageInputVariable,
            apiKeyInputVariable,
            historyMessageInputVariable,

        ]
        // console.log('variableDefs', variableDefs)

        const inputValues = await resolveInputVariables(context, variableDefs)

        const collector = new SafeRunCollectorHandler(context.userId, context.workflowId)

        const model = new ChatDeepSeek({
            modelName,
            temperature,
            streaming,
            apiKey: inputValues[apiKeyInputVariable.id],

            callbacks: [collector]
        })

        const messages = [
            new SystemMessage(inputValues[systemMessageInputVariable.id]),
            ...(Array.isArray(inputValues[historyMessageInputVariable.id])
                ? inputValues[historyMessageInputVariable.id]
                : []),
            new HumanMessage(inputValues[inputTextInputVariable.id] || '')
        ] as BaseMessage[]



        let result: any

        if (isOutputPortConnected(context.json.edges, node.id, messageOutputVariable.id)) {
            // 如果 messageOutputVariable 连接了其他节点，则使用流式输出
            const resultMessage = await model.invoke(messages)
            result = resultMessage.content
        }



        const messagePortId = messageOutputVariable.id
        const lmPortId = languageModelOutputVariable.id



        const elapsed = performance.now() - t0
        writeLogs(context, node.id, data.title, data.type, {
            [messagePortId]: {
                content: result ?? '',
                outputPort: languageModelOutputVariable,
                elapsed: elapsed
            }
        }, elapsed)
        // ✅ 写入语言模型结构输出日志（立即可用的）
        writeLogs(context, node.id, data.title, data.type, {
            [lmPortId]: {
                content: {
                    model: 'As ChatDeepSeek LLM Model: ' + model.model,
                    messages: messages.map(msg => msg.content).slice(0, 200) + '...(内容过长已截断)' // 限制输出长度
                },
                outputPort: languageModelOutputVariable,
                elapsed: elapsed
            }
        }, elapsed)

        return {
            [messagePortId]: result,
            [lmPortId]: {
                model,
                messages
            } as LanguageModel
        }
    } catch (err: any) {
        console.error(`ChatDeepSeek ${node.id} Error:`, err)
        throw new Error(`ChatDeepSeek 生成失败: ${err.message}`)
    }

}
