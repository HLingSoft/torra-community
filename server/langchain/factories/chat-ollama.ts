import type { ChatOllamaData } from '~~/types/node-data/chat-ollama'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable
} from '~~/types/workflow'
import { ChatOllama } from "@langchain/ollama";
import {
    resolveInputVariables,
    isOutputPortConnected,
    writeLogs
} from '../utils'

import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'
import { SafeRunCollectorHandler } from '../safeRunCollectorHandler'

interface LanguageModel {
    model: ChatOllama
    messages: BaseMessage[]
}

/** Ollama 节点工厂函数 */
export async function chatOllamaFactory(
    node: LangFlowNode,
    context: BuildContext
) {

    try {
        const t0 = performance.now()
        const data = node.data as ChatOllamaData
        const {
            modelNameInputVariable,
            historyMessageInputVariable,
            temperature,
            streaming,
            inputTextInputVariable,
            systemMessageInputVariable,

            baseURLInputVariable,
            messageOutputVariable,
            languageModelOutputVariable
        } = data

        const variableDefs: InputPortVariable[] = [
            inputTextInputVariable,
            systemMessageInputVariable,
            modelNameInputVariable,
            baseURLInputVariable,
            historyMessageInputVariable
        ]


        const inputValues = await resolveInputVariables(context, variableDefs)
        const modelName = inputValues[modelNameInputVariable.id] || ''
        const baseURL = inputValues[baseURLInputVariable.id] || ''
        const collector = new SafeRunCollectorHandler(context.userId, context.workflowId)

        const model = new ChatOllama({
            model: modelName,
            temperature,
            streaming,
            maxRetries: 3,
            baseUrl: baseURL,
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
                    model: 'As LLM Model: ' + model.model,
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
        console.error(`ChatOllama ${node.id} Error:`, err)
        throw new Error(`ChatOllama 生成失败: ${err.message}`)
    }

}
