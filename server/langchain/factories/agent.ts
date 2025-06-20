import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { AgentData } from '@/types/node-data/agent'
import { resolveInputVariables, wrapRunnable, writeLog } from '../../langchain/resolveInput'
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { RunnableLambda } from '@langchain/core/runnables'

export async function agentFactory(node: LangFlowNode, context: BuildContext) {
    /* ---------- 1. 解析输入 ---------- */
    const data = node.data as AgentData
    // console.log('Agent Node Data:')

    const variables = [
        data.inputInputVariable,
        data.instructionInputVariable,
        data.historyMessageInputVariable,  // 新增
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
    // const historyMsg = v[data.historyMessageInputVariable.id] as BaseMessage[]


    /* ---------- 2. 创建延迟执行的 Agent Runnable ---------- */
    const agentRunnable = RunnableLambda.from(async () => {
        const agent = createReactAgent({
            llm: new ChatOpenAI({
                modelName: data.modelName,
                apiKey,
                configuration: { baseURL },

            }),
            tools,
        })

        const messages = [
            ...(instruction ? [{ role: 'system', content: instruction }] : []),
            // ...(Array.isArray(historyMsg) ? historyMsg : (historyMsg ? [historyMsg] : [])),
            { role: 'user', content: question },
        ]


        const result = await agent.invoke({ messages })
        // console.log('Agent Result:', result.messages)
        const finalResult = result.messages?.at(-1)?.content ?? '无返回'



        return finalResult
    })

    /* ---------- 3. 包装延迟执行并返回 ---------- */
    const wrapped = wrapRunnable(
        agentRunnable,
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: data.outputVariable.id,
            logFormat: res => JSON.parse(JSON.stringify({ type: 'agent', data: res }))
        }
    )

    return {
        [data.outputVariable.id]: wrapped,
    }
}
