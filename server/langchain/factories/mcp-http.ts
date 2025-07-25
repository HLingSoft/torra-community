/* ------------------------------------------------------------------
 * nodes/mcpHttpFactory.ts  (resilient, server-agnostic, Zod-aware)
 * ------------------------------------------------------------------ */

import type { LangFlowNode, BuildContext, InputPortVariable } from '~~/types/workflow'
import type { MCPHttpData } from '~~/types/node-data/mcp-http'

import { resolveInputVariables, writeLogs } from '../utils'
import { DynamicStructuredTool } from 'langchain/tools'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { z } from 'zod'
import { useJSONStringify } from '~/composables'

/* ------------------------------------------------------------------ *
 * Helpers: detect Zod, convert to json-ish, map to Zod
 * ------------------------------------------------------------------ */

type JsonSchema = {
    type?: string
    properties?: Record<string, any>
    required?: string[]
    [k: string]: any
} | undefined | null

function isZodType(v: any): v is z.ZodTypeAny {
    return v && typeof v === 'object' && typeof v.safeParse === 'function'
}

function zodToJsonType(v: z.ZodTypeAny | any): string | undefined {
    if (!isZodType(v)) return undefined
    const tn = (v as any)?._def?.typeName ?? ''
    if (tn.includes('String')) return 'string'
    if (tn.includes('Number')) return 'number'
    if (tn.includes('Boolean')) return 'boolean'
    if (tn.includes('Array')) return 'array'
    if (tn.includes('Object') || tn.includes('Record')) return 'object'
    return undefined
}

/** inputSchema + annotations → merged json-like schema (handles ZodRawShape) */
function coalesceMcpSchema(inputSchema: JsonSchema, annotations: JsonSchema): Required<JsonSchema> {
    const inS = (inputSchema && typeof inputSchema === 'object') ? inputSchema : {}
    const ann = (annotations && typeof annotations === 'object') ? annotations : {}

    let props: Record<string, any> | undefined
    let req: string[] | undefined

    // prefer explicit inputSchema if it has fields
    if (inS.properties && Object.keys(inS.properties).length) {
        props = { ...inS.properties }
        req = Array.isArray(inS.required) ? [...inS.required] : undefined
    }

    // else inspect annotations for ZodRawShape
    if (!props && ann && ann.properties && typeof ann.properties === 'object') {
        const out: Record<string, any> = {}
        let got = false
        for (const [k, v] of Object.entries(ann.properties)) {
            if (isZodType(v)) {
                const t = zodToJsonType(v) ?? 'string'
                out[k] = { type: t }
                got = true
            } else if (v && typeof v === 'object' && 'type' in v) {
                out[k] = v
                got = true
            } else {
                out[k] = { type: 'string' }
                got = true
            }
        }
        if (got) {
            props = out
            req = Array.isArray(ann.required) ? [...ann.required] : req
        }
    }

    // fallback
    if (!props) {
        props = { input: { type: 'string', description: '原始输入（任意字符串或JSON）' } }
        req = []
    }

    // if no required & only one field -> mark required (helps LLM pass arg)
    if ((!req || req.length === 0) && Object.keys(props).length === 1) {
        req = Object.keys(props)
    }

    return { type: 'object', properties: props, required: req ?? [] }
}

/** json-like schema → Zod */
function jsonSchemaToZod(schema: any): z.ZodTypeAny {
    const props = schema?.properties ?? {}
    const required: string[] = schema?.required ?? []
    const shape: Record<string, z.ZodTypeAny> = {}

    for (const [k, v] of Object.entries(props as Record<string, any>)) {
        const desc = (v as any).description || `字段 ${k}`
        let zType: z.ZodTypeAny
        switch ((v as any).type) {
            case 'string': zType = z.string(); break
            case 'number':
            case 'integer': zType = z.number(); break
            case 'boolean': zType = z.boolean(); break
            case 'object': zType = z.record(z.string(), z.any()); break
            case 'array': zType = z.array(z.any()); break
            default:
                if (Array.isArray((v as any).enum) && (v as any).enum.length > 0) {
                    zType = z.enum((v as any).enum as [string, ...string[]])
                } else {
                    zType = z.any()
                }
        }
        if (!required.includes(k)) zType = zType.optional()
        shape[k] = zType.describe(desc)
    }
    // passthrough 允许额外字段，避免模型输出多字段时抛错
    return z.object(shape).passthrough()
}

/** 构造最终 Zod schema */
function buildZodForTool(toolInfo: any) {
    const schema = coalesceMcpSchema(toolInfo.inputSchema, toolInfo.annotations)
    return { mergedSchema: schema, zodSchema: jsonSchemaToZod(schema) }
}

/* ------------------------------------------------------------------ *
 * 日志容器保障
 * ------------------------------------------------------------------ */
function ensureLogBucket(
    context: BuildContext,
    nodeId: string,
    portId: string,
    nodeTitle: string,
    nodeType: string,
    elapsed: number
) {
    context.logs ||= {}
    context.logs[nodeId] ||= {}
    if (!context.logs[nodeId][portId]) {
        context.logs[nodeId][portId] = {
            content: { tools: [], runResult: [] },
            outputPort: { id: portId, name: nodeTitle, type: nodeType } as any,
            elapsed,
        }
    }
    return context.logs[nodeId][portId]
}

/* ------------------------------------------------------------------ *
 * 入参宽松解析 + 单字段空参补位
 * ------------------------------------------------------------------ */
function coerceArgsForSchema(raw: unknown): any {
    if (raw == null) return {}
    if (typeof raw === 'string') {
        const t = raw.trim()
        if (!t) return {}
        try {
            return JSON.parse(t)
        } catch {
            return { input: raw }
        }
    }
    if (typeof raw === 'object') return raw
    return { input: raw }
}

function fillSingleKeyIfEmpty(args: any, mergedSchema: ReturnType<typeof coalesceMcpSchema>): any {
    if (!args || typeof args !== 'object' || Array.isArray(args)) return args
    const keys = Object.keys(mergedSchema!.properties || {})
    if (keys.length === 1 && Object.keys(args).length === 0) {
        return { [keys[0]]: '' } // server 决定如何处理空字符串
    }
    return args
}

/* ------------------------------------------------------------------ *
 * MCP-HTTP 工厂函数
 * ------------------------------------------------------------------ */
export async function mcpHttpFactory(node: LangFlowNode, context: BuildContext) {
    const t0 = performance.now()
    const data = node.data as MCPHttpData
    const { urlInputVariable, tokenInputVariable, outputVariable } = data

    // 1. resolve inputs
    const inputVals = await resolveInputVariables(
        context,
        [urlInputVariable, tokenInputVariable] as InputPortVariable[],
    )
    const url = inputVals[urlInputVariable.id]
    const token = inputVals[tokenInputVariable.id]

    // 2. connect MCP client
    const client = new Client({ name: 'mcp-http', version: '1.0.0' })
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const transport = new StreamableHTTPClientTransport(new URL(url), {
        requestInit: { headers },
    })
    await client.connect(transport).catch(err => {
        throw new Error(`MCP 连接失败: ${err instanceof Error ? err.message : String(err)}`)
    })

    // 3. list tools
    const list = (await client.listTools()).tools ?? []

    const qTool = list.find(t => t.name === 'query_XMJ_DB')


    // 4. wrap each tool
    const toolInstances = list.map(toolInfo => {
        const { mergedSchema, zodSchema } = buildZodForTool(toolInfo)

        return new DynamicStructuredTool({
            name: toolInfo.name,
            description: toolInfo.description ?? 'MCP Tool',
            schema: zodSchema,
            func: async (rawArgs: any) => {
                const toolT0 = performance.now()

                let coerced = coerceArgsForSchema(rawArgs)
                coerced = fillSingleKeyIfEmpty(coerced, mergedSchema)

                let parsed: any
                try {
                    parsed = zodSchema.parse(coerced)
                } catch (err) {
                    console.warn(`[MCP-HTTP:${toolInfo.name}] schema.parse 失败，使用宽松参数继续。`, err)
                    parsed = coerced
                }


                let callResult: any
                try {
                    callResult = await client.callTool({
                        name: toolInfo.name,
                        arguments: parsed as Record<string, unknown>,
                    })
                } catch (err) {
                    callResult = { error: err instanceof Error ? err.message : String(err) }
                }

                // 日志
                const logBucket = ensureLogBucket(
                    context,
                    node.id,
                    outputVariable.id,
                    node.data.title,
                    node.data.type,
                    performance.now() - t0
                )
                try {
                    logBucket.content.runResult.push({
                        name: toolInfo.name,
                        description: toolInfo.description ?? 'MCP Tool',
                        args: useJSONStringify(parsed),
                        result: useJSONStringify(callResult?.content ?? callResult).slice(0, 200) + '...(截断)',
                        elapsed: performance.now() - toolT0,
                    })
                } catch { /* ignore */ }

                // 返回首段文本；无则 json
                const contentArr = (callResult?.content as any[]) || []
                const text = contentArr[0]?.text ?? callResult?.error ?? useJSONStringify(callResult)
                return typeof text === 'string' ? text : useJSONStringify(text)
            },
        })
    })

    const elapsed = performance.now() - t0

    // 5. log tool list
    writeLogs(
        context,
        node.id,
        node.data.title,
        node.data.type,
        {
            [outputVariable.id]: {
                content: {
                    tools: toolInstances.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                    })),
                    runResult: [],
                },
                outputPort: outputVariable,
                elapsed,
            }
        },
        elapsed
    )

    // 6. return -> Agent input
    return {
        [outputVariable.id]: toolInstances
    }
}
