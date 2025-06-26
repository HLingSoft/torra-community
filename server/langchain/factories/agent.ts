import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { AgentData } from '@/types/node-data/agent'
import { resolveInputVariables, wrapRunnable, writeLogs } from '../utils'
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { RunnableLambda } from '@langchain/core/runnables'
import type { BaseMessage } from '@langchain/core/messages'
import { SafeRunCollectorHandler } from '../safeRunCollectorHandler'

import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function agentFactory(node: LangFlowNode, context: BuildContext) {
    const t0 = performance.now()
    const data = node.data as AgentData

    const variables = [
        data.inputInputVariable,
        data.instructionInputVariable,
        data.historyMessageInputVariable,
        data.apiKeyInputVariable,
        data.baseURLInputVariable,
        data.toolsInputVariable,
    ]

    const v = await resolveInputVariables(context, variables)

    const toolsRaw = v[data.toolsInputVariable.id]
    const tools = (Array.isArray(toolsRaw) ? toolsRaw : [toolsRaw]).filter(Boolean).flat()



    const baseURL = v[data.baseURLInputVariable.id]
    const apiKey = v[data.apiKeyInputVariable.id]
    const question = v[data.inputInputVariable.id]
    const instruction = v[data.instructionInputVariable.id]
    const historyMsg = v[data.historyMessageInputVariable.id] as BaseMessage[]

    // ✅ 收集 token 消耗的 handler
    const collector = new SafeRunCollectorHandler(context.userId, context.workflowId)
    // const collector = new ConsoleCallbackHandler()

    const agentRunnable = RunnableLambda.from(async () => {
        const agent = createReactAgent({
            llm: new ChatOpenAI({
                temperature: 0,
                modelName: data.modelName,
                apiKey,
                configuration: { baseURL },
                callbacks: [collector], // ✅ 注入 callback
            }),
            tools,

        })

        const messages = [
            ...(instruction ? [new SystemMessage(instruction)] : []),
            ...(Array.isArray(historyMsg) ? historyMsg : (historyMsg ? [historyMsg] : [])),
            ...(question ? [new HumanMessage(question)] : [])
        ];

        const result = await agent.invoke({ messages }, { callbacks: [collector] })


        return result.messages?.at(-1)?.content ?? '无返回'
    })

    const wrapped = wrapRunnable(
        agentRunnable,
        node.id,
        {
            context,
            portId: data.outputVariable.id,
            logFormat: res => ({ type: 'agent', data: res }), // 自定义格式
            outputPort: data.outputVariable, // 输出端口
        }
    )
    const elapsed = performance.now() - t0
    writeLogs(context, node.id, data.title, data.type, {
        [data.outputVariable.id]: {
            content: '',
            outputPort: data.outputVariable,
            elapsed: 0,
        }
    }, elapsed)

    return {
        [data.outputVariable.id]: wrapped,
    }
}
