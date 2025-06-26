import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { AgentData } from '@/types/node-data/agent'
import { resolveInputVariables, wrapRunnable } from '../utils'
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { RunnableLambda } from '@langchain/core/runnables'
import type { BaseMessage } from '@langchain/core/messages'
import { SafeRunCollectorHandler } from '../safeRunCollectorHandler'
// import { ConsoleCallbackHandler } from "langchain/callbacks";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export async function agentFactory(node: LangFlowNode, context: BuildContext) {
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

    console.log('[🧠 Agent 工厂] 收集到的工具:', tools)

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
        // console.log('[🧠 Agent 输出 result]', result.messages)

        return result.messages?.at(-1)?.content ?? '无返回'
    })

    const wrapped = wrapRunnable(
        agentRunnable,
        node.id,
        data.title, // 节点名称（用于整体日志显示）
        data.type,  // 节点类型（如 agent、api-tool 等）
        context.onRunnableElapsed,
        {
            context,
            portId: data.outputVariable.id,
            logFormat: res => ({ type: 'agent', data: res }), // 自定义格式
            // collector,
            outputPort: data.outputVariable, // 输出端口
        }
    )

    return {
        [data.outputVariable.id]: wrapped,
    }
}
