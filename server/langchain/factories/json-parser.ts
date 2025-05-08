import type { JSONParserData } from '@/types/node-data/json-parser';
import type { BuildContext, FlowNode, InputPortVariable } from '~/types/workflow';

import { resolveInputVariables, writeLog } from '../../langchain/resolveInput';
import { jsonrepair } from 'jsonrepair';
import { z, ZodTypeAny } from 'zod';

function buildZodSchema(schemaDef: Record<string, string>) {
    const shape: Record<string, ZodTypeAny> = {};
    for (const [key, type] of Object.entries(schemaDef)) {
        switch (type) {
            case 'string':
                shape[key] = z.string();
                break;
            case 'number':
                shape[key] = z.number();
                break;
            case 'boolean':
                shape[key] = z.boolean();
                break;
            case 'array':
                shape[key] = z.array(z.any());
                break;
            case 'object':
                shape[key] = z.record(z.any());
                break;
            default:
                shape[key] = z.any();
        }
    }
    return z.object(shape);
}

function extractJsonLike(input: string): string {
    // 去掉 ```json、``` 以及首尾空格
    let cleaned = input.replace(/```json|```/gi, '').trim();

    const likelyKeyValueOnly = !cleaned.includes('{') && !cleaned.includes('[');
    if (likelyKeyValueOnly) {
        cleaned = `{${cleaned}}`; // 包一层大括号
    }

    return cleaned;
}

export async function jsonParserFactory(node: FlowNode, context: BuildContext) {
    const { inputMessageVariable, outputSchema, structuredOutputVariable } = node.data as JSONParserData;

    const variableDefs = [inputMessageVariable] as InputPortVariable[];
    const inputValues = await resolveInputVariables(context, variableDefs);
    const inputMessage = inputValues[inputMessageVariable.name];

    let result: any;

    try {
        const cleaned = extractJsonLike(inputMessage);
        const repaired = jsonrepair(cleaned);
        const parsed = JSON.parse(repaired);

        const schema = buildZodSchema(outputSchema.value);
        result = schema.parse(parsed);

    } catch (err: any) {
        result = { error: true, message: err.message };
    }
    console.log('jsonParserFactory result', result);

    writeLog(context, node.id, structuredOutputVariable.id, result);

    return {
        [structuredOutputVariable.id]: result,

    };
}
