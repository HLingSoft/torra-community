/* ────────────────────────────────────────────────
   nodes/mcpHttpFactory.ts
───────────────────────────────────────────────── */
import type { LangFlowNode, BuildContext, InputPortVariable, OutputPortVariable } from '~/types/workflow'
import type { MCPHttpData } from '@/types/node-data/mcp-http'

import { resolveInputVariables, writeLogs } from '../utils'
import { StructuredTool } from 'langchain/tools'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { z } from 'zod'

/** JsonSchema转ZodSchema，支持基础类型、数组、对象、指针等 */
function jsonSchemaToZod(schema: any) {
    const props = schema?.properties ?? {}
    const required: string[] = schema?.required ?? []
    const shape: Record<string, any> = {}

    for (const [k, v] of Object.entries(props as Record<string, any>)) {
        const desc = (v as any).description || `字段 ${k}（类型：${(v as any).type ?? 'any'}）`
        let zType: any

        switch ((v as any).type) {
            case 'string': zType = z.string(); break
            case 'number': zType = z.number(); break
            case 'boolean': zType = z.boolean(); break
            case 'object': zType = z.record(z.any()); break
            case 'array':
                const itemType = v.items
                    ? jsonSchemaToZod({ properties: { item: v.items }, required: v.items?.required ?? [] }).shape.item
                    : z.any()
                zType = z.array(itemType)
                break
            case 'pointer':
                zType = z.object({
                    __type: z.literal('Pointer'),
                    className: z.string().describe('目标 class 名称'),
                    objectId: z.string().describe('对象 ID')
                })
                break
            case 'date':
                zType = z.string().describe(desc + '（格式为 YYYY-MM-DD 或 ISO 日期）')
                break
            default:
                zType = z.any()
        }
        if (!required.includes(k)) zType = zType.optional()
        shape[k] = zType.describe(desc)
    }
    return z.object(shape)
}
/** 保证输入schema为zod对象 */
function ensureZodSchema(schema: any) {
    if (schema && typeof schema.safeParse === 'function') {
        return schema as z.ZodTypeAny
    } else {
        return jsonSchemaToZod(schema)
    }
}

/** 真正访问 MCP 并返回工具数组（延迟调用 Tool._call） */
async function fetchMCPTools(
    url: string,
    token: string,

) {
    const client = new Client({ name: 'mcp-http', version: '1.0.0' })
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const transport = new StreamableHTTPClientTransport(new URL(url), {
        requestInit: { headers },
    })
    await client.connect(transport)
    const list = (await client.listTools()).tools ?? []

    return list.map(toolInfo => {
        const zodSchema = ensureZodSchema(toolInfo.inputSchema ?? {})
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

/**
 * MCP-HTTP 工厂函数（LangFlow专用签名）
 */
export async function mcpHttpFactory(node: LangFlowNode, context: BuildContext) {
    const t0 = performance.now()
    const data = node.data as MCPHttpData
    const { urlInputVariable, tokenInputVariable, outputVariable } = data

    // 1. 解析输入变量
    const inputVals = await resolveInputVariables(
        context,
        [urlInputVariable, tokenInputVariable] as InputPortVariable[],
    )
    const url = inputVals[urlInputVariable.id]
    const token = inputVals[tokenInputVariable.id]

    // 2. 拉取 MCP 工具（返回 StructuredTool[]，只在真正用时才调用 _call）
    const result = await fetchMCPTools(url, token)
    const elapsed = performance.now() - t0
    // 3. 写入日志（只记录工具名和描述，避免内容太大）
    writeLogs(
        context,
        node.id,
        node.data.title,
        node.data.type,
        {
            [outputVariable.id]: {
                content: result,
                outputPort: outputVariable,
                elapsed
            }
        },
        elapsed
    )
    // 4. 返回端口映射
    return {
        [outputVariable.id]: result
    }
}
