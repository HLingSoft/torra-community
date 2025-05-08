/* ────────────────────────────────────────────────
   nodes/mcpHttpFactory.ts
───────────────────────────────────────────────── */
import type { FlowNode, BuildContext, InputPortVariable } from '~/types/workflow'
import type { MCPHttpData } from '@/types/node-data/mcp-http'

import { resolveInputVariables, wrapRunnable, writeLog } from '../../langchain/resolveInput'
import { RunnableLambda } from '@langchain/core/runnables'

import { StructuredTool } from 'langchain/tools'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { z } from 'zod'

/* ---------- 工具函数：MCP JSON → Zod ---------- */
function jsonSchemaToZod(schema: any) {
    const props = schema?.properties ?? {}
    const shape: Record<string, any> = {}

    for (const [k, v] of Object.entries(props as Record<string, any>)) {
        const desc = (v as any).description ?? ''
        switch ((v as any).type) {
            case 'string': shape[k] = z.string().describe(desc); break
            case 'number': shape[k] = z.number().describe(desc); break
            case 'boolean': shape[k] = z.boolean().describe(desc); break
            default: shape[k] = z.any().describe(desc)
        }
    }
    return z.object(shape)
}

/* ---------- 真正访问 MCP 并返回 LC-Tool[] ---------- */
async function fetchMCPTools(url: string, token: string) {
    const client = new Client({ name: 'mcp-http', version: '1.0.0' })

    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const transport = new StreamableHTTPClientTransport(new URL(url), {
        requestInit: { headers },
    })
    await client.connect(transport)

    const list = (await client.listTools()).tools ?? []

    return list.map(toolInfo => {
        const zodSchema = jsonSchemaToZod(toolInfo.inputSchema ?? {})

        return new (class extends StructuredTool<typeof zodSchema> {
            name = toolInfo.name
            description = toolInfo.description ?? 'MCP Tool'
            schema = zodSchema
            async _call(args: z.infer<typeof zodSchema>) {
                const result = await client.callTool({ name: toolInfo.name, arguments: args })
                return (result.content as any[])?.[0]?.text ?? '无返回内容'
            }
        })()
    })
}

/* ---------- Factory ---------- */
export async function mcpHttpFactory(node: FlowNode, context: BuildContext) {
    const data = node.data as MCPHttpData
    const { urlVariable, tokenVariable, outputVariable } = data

    /* 1️⃣ 解析输入变量（纯同步） */
    const inputVals = await resolveInputVariables(
        context,
        [urlVariable, tokenVariable] as InputPortVariable[],
    )
    const url = inputVals[urlVariable.name]
    const token = inputVals[tokenVariable.name]





    /* 4️⃣ 返回端口映射 */
    const result = await fetchMCPTools(url, token)

    writeLog(
        context,
        node.id,
        outputVariable.id,
        result.map(t => "工具名称: " + t.name + "\n工具描述:" + t.description).join(', '),

    )



    return {
        [outputVariable.id]: result,   // 下游真正用到时才会访问 MCP

    }
}
