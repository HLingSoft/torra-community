/* ------------------------------------------------------------------
 * nodes/apiToolFactory.ts
 * ------------------------------------------------------------------
 * LangFlow / VueFlow 工作流节点：动态 API Tool
 *
 * 功能：
 *  - 从节点输入动态构造一个 LangChain StructuredTool，用于发起 HTTP 请求。
 *  - 支持 GET / POST / PUT / DELETE。
 *  - GET 模式支持 params（查询参数）与 headers（请求头）。
 *  - 非 GET 模式根据字段定义数组 FieldDef[] 构造请求体验证 schema；无字段时退化为宽松对象。
 *  - 请求执行时记录日志（请求信息 / 响应截断 / 耗时）。
 *  - 输出端口返回可直接被 LangChain / Agent 使用的 Tool 实例。
 *
 * 注意：
 *  - fetch 需在运行环境存在（Node18+ / polyfill）。
 *  - updatePortLog / writeLogs 依赖上层 utils 实现；要求其容忍结构化 content。
 *  - 若要扩展 PATCH / HEAD / 自定义方法，请在 HttpMethod 中增补。
 * ------------------------------------------------------------------ */

import { z } from 'zod'
import { nanoid } from 'nanoid'
import { StructuredTool } from 'langchain/tools'

import type { LangFlowNode, BuildContext, InputPortVariable } from '~~/types/workflow'
import type { APIToolData } from '~~/types/node-data/api-tool'
import { resolveInputVariables, writeLogs, updatePortLog } from '../utils'
import type { OutputPortVariable } from '~~/types/workflow'

/* ------------------------------------------------------------------ *
 * 类型定义
 * ------------------------------------------------------------------ */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 字段定义结构（用于构造请求体 schema） */
export type FieldDef = {
    key: string
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    description?: string
    items?: FieldDef[]
    required?: boolean
}

/* ------------------------------------------------------------------ *
 * 工具名清洗（兼容 OpenAI tool name 约束：小写、下划线、长度）
 * ------------------------------------------------------------------ */
function sanitizeToolName(name: string): string {
    let cleaned = name
        ?.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w]/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase()

    if (!cleaned || cleaned.length < 3) {
        cleaned = `tool_${nanoid(6)}`
    }
    return cleaned
}

/* ------------------------------------------------------------------ *
 * Field 数组 -> ZodObject
 * - 未标必填字段均 optional
 * - array(items[]) 递归
 * - object -> 宽松 record(any)
 * ------------------------------------------------------------------ */
function generateZodSchemaFromFieldArray(fields: FieldDef[]): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {}
    for (const field of fields) {
        let zodType: z.ZodTypeAny
        switch (field.type) {
            case 'number':
                zodType = z.number()
                break
            case 'boolean':
                zodType = z.boolean()
                break
            case 'object':
                // 这里用 record<string, any>，兼容未知结构
                zodType = z.record(z.string(), z.any())
                break
            case 'array': {
                if (field.items?.length) {
                    const inner = generateZodSchemaFromFieldArray(field.items)
                    zodType = z.array(inner)
                } else {
                    zodType = z.array(z.any())
                }
                break
            }
            default:
                zodType = z.string()
                break
        }
        if (field.description) {
            zodType = zodType.describe(field.description.trim())
        }
        if (!field.required) {
            zodType = zodType.optional()
        }
        shape[field.key] = zodType
    }
    return z.object(shape)
}

/* ------------------------------------------------------------------ *
 * GET 输入 schema：params + headers
 *   - params: 查询参数（值 string/number/boolean）
 *   - headers: 自定义请求头（string->string）
 * ------------------------------------------------------------------ */
const GET_INPUT_SCHEMA = z
    .object({
        params: z
            .record(
                z.string(), // key 类型
                z.union([z.string(), z.number(), z.boolean()]) // value
            )
            .optional(),
        headers: z
            .record(
                z.string(), // key 类型
                z.string() // value
            )
            .optional(),
    })
    .describe('GET 查询参数与自定义请求头')

/* ------------------------------------------------------------------ *
 * POST/PUT/DELETE body schema 构建
 *   - 若 rawBody 是字段数组 FieldDef[] → 精细 schema
 *   - 若 rawBody 是字符串 → 尝试 JSON.parse → 同上
 *   - 否则 → 宽松对象（passthrough）
 *   - 附带可选 headers
 * ------------------------------------------------------------------ */
function buildBodySchema(rawBody: unknown): z.ZodTypeAny {
    const HeadersField = {
        headers: z
            .record(
                z.string(),
                z.string()
            )
            .optional(),
    }

    if (Array.isArray(rawBody)) {
        return generateZodSchemaFromFieldArray(rawBody as FieldDef[]).extend(HeadersField)
    }

    if (typeof rawBody === 'string') {
        try {
            const parsed = JSON.parse(rawBody)
            if (Array.isArray(parsed)) {
                return generateZodSchemaFromFieldArray(parsed as FieldDef[]).extend(HeadersField)
            }
            if (parsed && typeof parsed === 'object') {
                // 任意对象；宽松 passthrough
                return z.object({}).passthrough().extend(HeadersField)
            }
        } catch {
            /* ignore parse error -> fallback below */
        }
    }

    // fallback
    return z.object({}).passthrough().extend(HeadersField)
}

/* ------------------------------------------------------------------ *
 * 结构化 HTTP 请求工具类
 * ------------------------------------------------------------------ */
class HttpRequestTool extends StructuredTool<any> {
    name: string
    description: string
    schema: z.ZodTypeAny
    private url: string
    private method: HttpMethod
    private token?: string
    private context: BuildContext
    private nodeId: string
    private portId: string

    constructor(cfg: {
        name: string
        description: string
        url: string
        method: HttpMethod
        token?: string
        schema: z.ZodTypeAny
        context: BuildContext
        nodeId: string
        portId: string
    }) {
        super()
        this.name = cfg.name
        this.description = cfg.description
        this.url = cfg.url
        this.method = cfg.method
        this.token = cfg.token
        this.schema = cfg.schema
        this.context = cfg.context
        this.nodeId = cfg.nodeId
        this.portId = cfg.portId
    }

    async _call(input: any): Promise<string> {
        const t0 = performance.now()

        // 1) 参数校验
        let parsed: any
        try {
            parsed = this.schema.parse(input ?? {})
        } catch (err: any) {
            const msg = `参数校验失败: ${err?.message ?? String(err)}`
            this.logResult({ error: msg }, performance.now() - t0)
            return msg
        }

        // 2) URL + 查询参数
        let finalUrl = this.url
        if (this.method === 'GET' && parsed?.params && typeof parsed.params === 'object') {
            const usp = new URLSearchParams()
            for (const [k, v] of Object.entries(parsed.params)) {
                if (v === undefined || v === null) continue
                usp.append(k, String(v))
            }
            const sep = finalUrl.includes('?') ? '&' : '?'
            finalUrl = finalUrl + sep + usp.toString()
        }

        // 3) Headers（合并 token + 输入 headers）
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`
        if (parsed?.headers && typeof parsed.headers === 'object') {
            for (const [k, v] of Object.entries(parsed.headers)) {
                if (v == null) continue
                headers[k] = String(v)
            }
        }

        // 4) RequestInit
        const init: RequestInit = { method: this.method, headers }
        if (this.method !== 'GET') {
            // 去掉 headers/params 作为 body
            const { headers: _h, params: _p, ...body } = parsed || {}
            init.body = JSON.stringify(body ?? {})
        }

        // 5) 执行请求
        let respText = ''
        let status: number | undefined
        try {
            const u = new URL(finalUrl) // 协议校验
            if (u.protocol !== 'http:' && u.protocol !== 'https:') {
                throw new Error(`不支持的协议: ${u.protocol}`)
            }

            const resp = await fetch(finalUrl, init)
            status = resp.status
            const ct = resp.headers.get('content-type') || ''
            if (!resp.ok) {
                respText = `HTTP ${resp.status}: ${await resp.text()}`
            } else if (ct.includes('application/json')) {
                const data = await resp.json()
                respText = JSON.stringify(data, null, 2)
            } else {
                respText = (await resp.text()).trim()
            }
        } catch (err: any) {
            respText = `请求失败: ${err?.message ?? String(err)}`
        }

        const elapsed = performance.now() - t0
        this.logResult({ url: finalUrl, status, response: respText }, elapsed)
        return respText
    }

    private logResult(payload: any, elapsed: number) {
        updatePortLog(this.context, this.nodeId, this.portId, {
            content: payload,
            elapsed,
        })
    }
}

/* ------------------------------------------------------------------ *
 * API Tool 节点工厂
 * ------------------------------------------------------------------ */
export async function apiToolFactory(node: LangFlowNode, context: BuildContext) {
    const t0 = performance.now()
    const data = node.data as APIToolData
    const {
        toolNameInputVariable,
        toolDescriptionInputVariable,
        methodType,
        urlInputVariable,
        bodyInputVariable,
        tokenInputVariable,
        toolOutputVariable,
    } = data

    // 解析输入
    const inputValues = await resolveInputVariables(context, [
        toolNameInputVariable,
        toolDescriptionInputVariable,
        urlInputVariable,
        bodyInputVariable,
        tokenInputVariable,
    ] as InputPortVariable[])

    const toolName = sanitizeToolName(inputValues[toolNameInputVariable.id])
    const toolDescription =
        inputValues[toolDescriptionInputVariable.id] || 'Dynamic HTTP request tool'
    const url = inputValues[urlInputVariable.id]
    const token = inputValues[tokenInputVariable.id]
    const method = (methodType || 'GET').toUpperCase() as HttpMethod

    // schema
    const rawBodyRuntime = inputValues[bodyInputVariable.id]
    const rawBody = rawBodyRuntime ?? bodyInputVariable.value
    const schema = method === 'GET' ? GET_INPUT_SCHEMA : buildBodySchema(rawBody)

    // Tool 实例
    const tool = new HttpRequestTool({
        name: toolName,
        description: toolDescription,
        url,
        method,
        token,
        schema,
        context,
        nodeId: node.id,
        portId: toolOutputVariable.id,
    })

    const elapsed = performance.now() - t0

    // 初始日志
    writeLogs(
        context,
        node.id,
        data.title,
        data.type,
        {
            [toolOutputVariable.id]: {
                content: {
                    tool: { name: toolName, description: toolDescription, method, url },
                    runResult: [],
                },
                outputPort: toolOutputVariable,
                elapsed,
            },
        },
        elapsed
    )

    // 返回端口映射
    return {
        [toolOutputVariable.id]: tool,
    }
}
