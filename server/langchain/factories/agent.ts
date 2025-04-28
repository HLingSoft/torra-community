
import type { AgentData } from '@/types/node-data/agent'
import type { BuildContext, FlowNode } from '~/types/workflow'
import { resolveInputVariables, wrapRunnable } from '../../langchain/resolveInput'
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { RunnableLambda } from '@langchain/core/runnables'
import { StructuredTool } from 'langchain/tools'

export async function agentFactory(node: FlowNode, context: BuildContext) {
    const data = node.data as AgentData
    const {
        modelName,
        apiKeyVariable,
        baseURLVariable,
        inputVariable,
        instructionVariable,
        toolsVariable,
        outputVariable,
    } = data

    const inputValues = await resolveInputVariables(context, [
        inputVariable,
        instructionVariable,
        apiKeyVariable,
        baseURLVariable,
        toolsVariable,
    ])

    const tools = Array.isArray(inputValues[toolsVariable.name])
        ? inputValues[toolsVariable.name]
        : [inputValues[toolsVariable.name]]

    // console.log('🧠 agentFactory tools:', tools)

    const baseURL = inputValues[baseURLVariable.name]
    const apiKey = inputValues[apiKeyVariable.name]
    const question = inputValues[inputVariable.name]
    const instruction = inputValues[instructionVariable.name]

    // const toolDescriptions = tools.map((t: StructuredTool) => t.description || '').join('\n\n')
    // console.log('🧠 agentFactory toolDescriptions:', toolDescriptions)

    const agent = createReactAgent({
        llm: new ChatOpenAI({ modelName: modelName || 'gpt-4.1', apiKey, configuration: { baseURL } }),
        tools,
        // stateSchema: MyStateSchema,
    })
    //   你可以通过工具从 LeanCloud 查询数据。
    const prompt = `${instruction}\n\n` // ❗ 仅保留用户定义部分
    // console.log('🧠 agentFactory prompt:', prompt)

    const agentChain = RunnableLambda.from(async () => {
        const messages = [
            { role: 'system', content: prompt },
            { role: 'user', content: question },
        ]

        const result = await agent.invoke({ messages })
        // console.log('🧠 agentFactory result:', result)
        const final = result.messages?.at(-1)?.content ?? '无返回'
        // console.log(node.id, '🧠 agentFactory final:', final)
        return final
    })

    return {
        [outputVariable.id]: wrapRunnable(
            agentChain,                // runnable
            node.id,              // nodeId
            context.onRunnableElapsed, // 回调（可能是 undefined）
        ),
    }
}
