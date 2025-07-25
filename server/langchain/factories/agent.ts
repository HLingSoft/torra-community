import type { LangFlowNode, BuildContext } from '~~/types/workflow'
import type { AgentData } from '~~/types/node-data/agent'
import { resolveInputVariables, writeLogs } from '../utils'
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { SystemMessage, HumanMessage, type BaseMessage } from '@langchain/core/messages'
import { SafeRunCollectorHandler } from '../safeRunCollectorHandler'
import type { StructuredTool } from 'langchain/tools'

/* -------------------------------------------------- *
 * 将来自多个节点的工具统一展开
 * 支持：
 *   - 单工具实例
 *   - MCP 工具集合 { tools: [...], meta: [...] }
 *   - 深层数组嵌套
 * -------------------------------------------------- */
function normalizeTools(raw: unknown): StructuredTool[] {
    if (!raw) return []
    if (Array.isArray(raw)) {
        return raw.flatMap(normalizeTools)
    }
    if (raw && typeof raw === 'object') {
        const obj = raw as any
        if (Array.isArray(obj.tools)) {
            return obj.tools as StructuredTool[]
        }
        // duck typing: StructuredTool 实例（带 name/_call）
        if (typeof obj.name === 'string' && typeof obj._call === 'function') {
            return [obj as StructuredTool]
        }
    }
    return []
}

export async function agentFactory(node: LangFlowNode, context: BuildContext) {
    const t0 = performance.now()
    try {
        const data = node.data as AgentData

        // 1. 解析输入变量
        const inputVars = await resolveInputVariables(context, [
            data.inputInputVariable,
            data.instructionInputVariable,
            data.historyMessageInputVariable,
            data.apiKeyInputVariable,
            data.baseURLInputVariable,
            data.toolsInputVariable,
        ])

        const apiKey = inputVars[data.apiKeyInputVariable.id]
        const baseURL = inputVars[data.baseURLInputVariable.id]
        const question = inputVars[data.inputInputVariable.id]
        const instruction = inputVars[data.instructionInputVariable.id]
        const historyMsg = inputVars[data.historyMessageInputVariable.id] as BaseMessage[] | BaseMessage | undefined

        // 2. 解出工具
        const toolsRaw = inputVars[data.toolsInputVariable.id]
        const tools = normalizeTools(toolsRaw)

        console.log(
            `🛠 Agent(${node.id}) 接收工具 ${tools.length} 个:`,
            tools.map(t => t.name)
        )

        // 3. 构造 LLM + collector
        const collector = new SafeRunCollectorHandler(context.userId, context.workflowId)

        const llm = new ChatOpenAI({
            temperature: 0,
            modelName: data.modelName,
            apiKey,
            configuration: { baseURL },
            callbacks: [collector],
        })

        // 4. ReAct Agent
        const agent = createReactAgent({
            llm,
            tools,
        })

        // 5. 构造输入：强提醒模型使用工具
        const toolNames = tools.map(t => t.name)
        const toolInstruction = toolNames.length
            ? `你可以使用以下工具访问实时项目/数据库数据：${toolNames.join(', ')}。\n当用户的问题涉及实时数据（如 RFI、Task、Project 等）时，一定要调用工具获取最新信息再作答。`
            : ''

        const systemMsg = [instruction, toolInstruction].filter(Boolean).join('\n\n')

        const chatHistoryArray = Array.isArray(historyMsg)
            ? historyMsg
            : historyMsg
                ? [historyMsg]
                : []

        const messages = [
            ...(systemMsg ? [new SystemMessage(systemMsg)] : []),
            ...chatHistoryArray,
            ...(question ? [new HumanMessage(question)] : []),
        ]

        // 注意：LangGraph createReactAgent 通常期望 input+chat_history；
        // 但为了兼容现有结构，我们仍然传 messages；
        // 如需严格模式，可改为 agent.invoke({ input: question, chat_history: chatHistoryArray })
        const result = await agent.invoke({ messages }, { callbacks: [collector] })

        // 读取最终模型消息
        const message = result.messages?.at(-1)?.content ?? '无返回'

        const elapsed = performance.now() - t0
        writeLogs(
            context,
            node.id,
            data.title,
            data.type,
            {
                [data.outputVariable.id]: {
                    content: message,
                    outputPort: data.outputVariable,
                    elapsed,
                },
            },
            elapsed
        )

        return {
            [data.outputVariable.id]: message,
        }
    } catch (err: any) {
        console.error(`❌ Agent node ${node.id} (${node.data?.title}) 执行失败:`, err)
        throw new Error(`Agent 运行失败: ${err?.message ?? String(err)}`)
    }
}
