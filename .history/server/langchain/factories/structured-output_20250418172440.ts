import type { StructuredOutputData } from '@/types/node-data/structured-output'
import type {
    BuildContext,
    FlowNode,
    InputPortVariable,

} from '~/types/workflow'
import { RunnableLambda } from '@langchain/core/runnables'
import { JsonOutputFunctionsParser } from 'langchain/output_parsers'
import {
    RunnableSequence,
} from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function structuredOutputFactory(node: FlowNode, context: BuildContext) {
    console.log('structuredOutputFactory', node.data)
    const { inputMessageVariable, languageModelVariable, outputSchema, structuredOutputVariable, dataFrameOutputVariable } = node.data as StructuredOutputData
    // console.log('structuredOutputFactory', node.data)
    const variableDefs = [inputMessageVariable, languageModelVariable] as InputPortVariable[]


    const inputValues = await resolveInputVariables(context, variableDefs)
    const inputMessage = inputValues[inputMessageVariable.name]
    const languageModel = inputValues[languageModelVariable.name] as ChatOpenAI

    const outputFunctionSchema = {
        name: outputSchema.name,
        description:`   "You are an AI system designed to extract structured information from unstructured text. "
                "Given the input_text, return a JSON object with predefined keys based on the expected structure. "
                "Extract values accurately and format them according to the specified type "
                "(e.g., string, integer, float, date). "
                "If a value is missing or cannot be determined, return a default "
                "(e.g., null, 0, or 'N/A'). "
                "If multiple instances of the expected structure exist within the input_text, "
                "stream each as a separate JSON object."`,
        parameters: {
            type: 'object',
            properties: {
                ...outputSchema.value,
            },
            required: Object.keys(outputSchema.value),
        },
    }

    const llmWithFunction = languageModel.bind({
        functions: [outputFunctionSchema],
        function_call: { name: outputSchema.name },
    })
    // 4. 构造 runnable chain（提示 + LLM + parser）
    const runnablePrompt = RunnableSequence.from([
        (input: string) => input, // 简单 passthrough 输入
        llmWithFunction,
        new JsonOutputFunctionsParser(), // 将返回 JSON 结构化
    ])
    const result = await runnablePrompt.invoke(inputMessage)
    return {
        [structuredOutputVariable.id]: RunnableLambda.from(async () => {
            return result
        }),
        [dataFrameOutputVariable.id]: RunnableLambda.from(async () => {
            return result
        }),
    }
}
