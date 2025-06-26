import { z } from 'zod'
import { nanoid } from 'nanoid'

import { StructuredTool } from 'langchain/tools'
import type { LangFlowNode, BuildContext } from '~/types/workflow'
import { type APIToolData, apiToolMeta } from '~/types/node-data/api-tool'
import { resolveInputVariables, writeLogs, updatePortLog } from '../utils'
import type { OutputPortVariable } from '~/types/workflow'
/** 字段定义结构 */
type FieldDef = {
    key: string
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    description?: string
    items?: FieldDef[]
}

/** 清洗工具名称（兼容 OpenAI Tool 要求） */
function sanitizeToolName(name: string): string {
    let cleaned = name
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

/** 由字段定义数组生成 Zod 校验 schema */
function generateZodSchemaFromFieldArray(fields: FieldDef[]): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {}
    for (const field of fields) {
        let zodType: z.ZodTypeAny
        switch (field.type) {
            case 'number': zodType = z.number(); break
            case 'boolean': zodType = z.boolean(); break
            case 'object': zodType = z.record(z.any()); break
            case 'array':
                if (field.items?.length) {
                    const inner = generateZodSchemaFromFieldArray(field.items)
                    zodType = z.array(inner)
                } else {
                    zodType = z.array(z.object({}).passthrough())
                }
                break
            default: zodType = z.string()
        }
        if (field.description) {
            zodType = zodType.describe(field.description.trim())
        }
        shape[field.key] = zodType
    }
    return z.object(shape)
}

/** 结构化 HTTP 请求工具类 */
class HttpRequestTool extends StructuredTool<any> {
    name: string
    description: string
    schema: z.ZodTypeAny
    private url: string
    private method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    private token?: string
    private context: BuildContext
    private nodeId: string
    private portId: string



    constructor({ name, description, url, method, token, schema, context, nodeId, portId }: {
        name: string
        description: string
        url: string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE'
        token?: string
        schema: z.ZodTypeAny
        context: BuildContext
        nodeId: string
        portId: string
    }) {
        super()
        this.name = name
        this.description = description
        this.url = url
        this.method = method
        this.token = token
        this.schema = schema
        this.context = context
        this.nodeId = nodeId
        this.portId = portId

    }


    async _call(input: any): Promise<string> {
        const { method } = this
        const t0 = performance.now()

        let result = ''
        let error: string | undefined

        try {
            const parsed = this.schema.parse(input)

            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            if (this.token) headers['Authorization'] = `Bearer ${this.token}`

            const options: RequestInit = { method, headers }
            if (method !== 'GET') options.body = JSON.stringify(parsed)

            const response = await fetch(this.url, options)
            if (!response.ok) {
                result = `Error ${response.status}: ${await response.text()}`
            } else {
                const contentType = response.headers.get('content-type') || ''
                result = contentType.includes('application/json')
                    ? JSON.stringify(await response.json(), null, 2)
                    : (await response.text()).trim()
            }
        } catch (err: any) {
            error = err?.message || String(err)
            result = `Request failed: ${error}`
        }

        const elapsed = performance.now() - t0

        updatePortLog(this.context, this.nodeId, this.portId, {
            content: result,
            elapsed
        })




        return result
    }
}

/** API Tool 节点工厂函数 */
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

    const inputValues = await resolveInputVariables(context, [
        toolNameInputVariable,
        toolDescriptionInputVariable,
        urlInputVariable,
        bodyInputVariable,
        tokenInputVariable,
    ])

    const toolName = sanitizeToolName(inputValues[toolNameInputVariable.id])
    const toolDescription = inputValues[toolDescriptionInputVariable.id] || 'Dynamic HTTP request tool'
    const url = inputValues[urlInputVariable.id]
    const token = inputValues[tokenInputVariable.id]
    const method = methodType.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE'
    const rawBody = bodyInputVariable.value

    const schema = method === 'GET' ? z.object({}) : generateZodSchemaFromFieldArray(rawBody)

    const tool = new HttpRequestTool({
        name: toolName,
        description: toolDescription,
        url,
        method,
        token,
        schema,
        context,
        nodeId: node.id,
        portId: toolOutputVariable.id
    })
    const elapsed = performance.now() - t0


    // ✅ 正确结构化写入日志
    writeLogs(context, node.id, data.title, data.type, {
        [toolOutputVariable.id]: {
            content: '',
            outputPort: toolOutputVariable,
            elapsed: elapsed,

        }
    }, elapsed)

    return {
        [toolOutputVariable.id]: tool,
    }
}

