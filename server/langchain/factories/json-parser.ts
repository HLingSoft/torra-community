import type { JSONParserData } from '@/types/node-data/json-parser'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable
} from '~/types/workflow'

import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'
import { jsonrepair } from 'jsonrepair'
import { z, ZodTypeAny } from 'zod'

/**
 * 根据定义构建 Zod 校验器
 */
function buildZodSchema(schemaDef: Record<string, string>) {
    const shape: Record<string, ZodTypeAny> = {}
    for (const [key, type] of Object.entries(schemaDef)) {
        switch (type) {
            case 'string':
                shape[key] = z.string()
                break
            case 'number':
                shape[key] = z.number()
                break
            case 'boolean':
                shape[key] = z.boolean()
                break
            case 'array':
                shape[key] = z.array(z.any())
                break
            case 'object':
                shape[key] = z.record(z.any())
                break
            default:
                shape[key] = z.any()
        }
    }
    return z.object(shape)
}

/**
 * 尝试提取 JSON 结构（容错）
 */
function extractJsonLike(input: string): string {
    let cleaned = input.replace(/```json|```/gi, '').trim()
    const likelyKeyValueOnly = !cleaned.includes('{') && !cleaned.includes('[')
    if (likelyKeyValueOnly) {
        cleaned = `{${cleaned}}`
    }
    return cleaned
}

/**
 * JSON 解析器节点工厂函数
 */
export async function jsonParserFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const {
        inputMessageInputVariable,
        outputSchemaInputVariable,
        structuredOutputVariable
    } = node.data as JSONParserData

    const variableDefs = [inputMessageInputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
    const inputMessage = inputValues[inputMessageInputVariable.id]

    let result: any

    try {
        const cleaned = extractJsonLike(inputMessage)
        const repaired = jsonrepair(cleaned)
        const parsed = JSON.parse(repaired)

        const schema = buildZodSchema(outputSchemaInputVariable.value)
        result = schema.parse(parsed)
    } catch (err: any) {
        result = { error: true, message: err.message }
    }



    return {
        [structuredOutputVariable.id]: result
    }
}
