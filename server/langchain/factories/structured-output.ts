import type { StructuredOutputData } from '@/types/node-data/structured-output'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable,
} from '~/types/workflow'

import { JsonOutputFunctionsParser } from 'langchain/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import type { BaseMessage } from '@langchain/core/messages'
import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

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
    const {
        languageModelInputVariable,
        outputSchemaInputVariable,
        structuredOutputVariable,
    } = node.data as StructuredOutputData

    // 1. 解析输入变量
    const variableDefs = [languageModelInputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)
    const languageModel = inputValues[languageModelInputVariable.id] as LanguageModel

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
            properties: {
                ...outputSchemaInputVariable.value,
            },
            required: Object.keys(outputSchemaInputVariable.value),
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

    // 5. 执行推理
    const result = await runnablePrompt.invoke(languageModel.messages)
    console.log('StructuredOutput invoke result:', result)

    // 6. 日志
    // writeLog(context, node.id, structuredOutputVariable.id, result)

    // 7. 返回端口值
    return {
        [structuredOutputVariable.id]: result,
    }
}
