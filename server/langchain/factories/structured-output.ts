import type { StructuredOutputData } from '~~/types/node-data/structured-output'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable,
} from '~~/types/workflow'

import { JsonOutputFunctionsParser } from 'langchain/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import type { BaseMessage } from '@langchain/core/messages'
import { resolveInputVariables, writeLogs } from '../utils'

interface LanguageModel {
    model: ChatOpenAI
    messages: BaseMessage[]
}

/**
 * StructuredOutput 节点工厂函数
 * @param node - LangFlowNode 类型节点
 * @param context - DAG 运行上下文
 */
export async function structuredOutputFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const t0 = performance.now()
    const {
        languageModelInputVariable,
        outputSchemaInputVariable,
        structuredOutputVariable,
    } = node.data as StructuredOutputData

    // 1. 解析输入变量
    const variableDefs = [languageModelInputVariable] as InputPortVariable[]

    const inputValues = await resolveInputVariables(context, variableDefs)

    const languageModel = inputValues[languageModelInputVariable.id] as LanguageModel

    /* ===☆ 关键改动开始 ☆=== */
    // 为所有 array 字段补充默认 items: { type: 'string' }
    const schemaProperties = Object.fromEntries(
        Object.entries(outputSchemaInputVariable.value).map(([key, def]: any) => {
            if (def.type === 'array' && !def.items) {
                return [
                    key,
                    {
                        ...def,
                        items: { type: 'string' },
                    },
                ]
            }
            return [key, def]
        })
    )
    // 2. 构造 Function schema（用于 LLM function call）
    const outputFunctionSchema = {
        name: outputSchemaInputVariable.name,
        description: `
      You are an AI system designed to extract structured information from unstructured text.
      Given the input_text, return a JSON object with predefined keys based on the expected structure.
      Extract values accurately and format them according to the specified type (e.g., string, integer, float, date).
      If a value is missing or cannot be determined, return a default (e.g., null, 0, or 'N/A').
      If multiple instances of the expected structure exist within the input_text, stream each as a separate JSON object.
    `,
        parameters: {
            type: 'object',
            properties: schemaProperties,
            required: Object.keys(schemaProperties),
        },
    }

    // 3. 绑定 function call 到模型
    const llmWithFunction = (languageModel.model as ChatOpenAI).bind({
        functions: [outputFunctionSchema],
        function_call: { name: outputSchemaInputVariable.name },
    })

    // 4. 构造 runnable chain（LLM+结构化解析）
    const runnablePrompt = RunnableSequence.from([
        llmWithFunction,
        new JsonOutputFunctionsParser(), // 解析为 JSON
    ])

    const result = await runnablePrompt.invoke(languageModel.messages)



    // console.log('Structured Output Result:', result)

    // 6. 日志
    const elapsed = performance.now() - t0

    writeLogs(context, node.id, node.data.title, node.data.type, {
        [structuredOutputVariable.id]: {
            content: result,
            outputPort: structuredOutputVariable,
            elapsed, // 这里可以计算实际耗时
        },
    }, elapsed)

    // 7. 返回端口值
    return {
        [structuredOutputVariable.id]: result,
    }
}
