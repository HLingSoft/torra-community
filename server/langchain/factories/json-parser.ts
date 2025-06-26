import type { JSONParserData } from '@/types/node-data/json-parser'
import type {
    BuildContext,
    LangFlowNode,
} from '~/types/workflow'

import { resolveInputVariables, writeLogs } from '../utils'
import { jsonrepair } from 'jsonrepair'
import { z, ZodTypeAny } from 'zod'

function buildZodSchema(schemaDef: Record<string, string>) {
    const shape: Record<string, ZodTypeAny> = {}
    for (const [key, type] of Object.entries(schemaDef)) {
        switch (type) {
            case 'string': shape[key] = z.string(); break
            case 'number': shape[key] = z.number(); break
            case 'boolean': shape[key] = z.boolean(); break
            case 'array': shape[key] = z.array(z.any()); break
            case 'object': shape[key] = z.record(z.any()); break
            default: shape[key] = z.any()
        }
    }
    return z.object(shape)
}

function extractJsonLike(input: string): string {
    let cleaned = input.replace(/```json|```/gi, '').trim()
    const likelyKeyValueOnly = !cleaned.includes('{') && !cleaned.includes('[')
    if (likelyKeyValueOnly) {
        cleaned = `{${cleaned}}`
    }
    return cleaned
}

export async function jsonParserFactory(
    node: LangFlowNode,
    context: BuildContext
) {

    const t0 = performance.now()
    const {
        inputMessageInputVariable,
        outputSchemaInputVariable,
        structuredOutputVariable
    } = node.data as JSONParserData


    const inputValues = await resolveInputVariables(context, [inputMessageInputVariable])
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

    const elapsed = performance.now() - t0

    writeLogs(
        context,
        node.id,
        node.data.title,
        node.data.type,
        {
            [structuredOutputVariable.id]: {
                content: result,
                outputPort: structuredOutputVariable,
                elapsed,
            },
        },
        elapsed
    )

    return {
        [structuredOutputVariable.id]: result,
    }
}
