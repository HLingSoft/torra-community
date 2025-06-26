import type { ListOutputData } from '@/types/node-data/list-output'
import type {
    BuildContext,
    LangFlowNode,
} from '~/types/workflow'

import { JsonOutputFunctionsParser } from 'langchain/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import type { BaseMessage } from '@langchain/core/messages'
import { resolveInputVariables, writeLogs } from '../utils'

interface LanguageModel {
    model: ChatOpenAI
    messages: BaseMessage[]
}

const FN_NAME = 'extract_listed_data'

export async function listOutputFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const {
        languageModelInputVariable,
        outputSchemaInputVariable,
        listOutputVariable,
    } = node.data as ListOutputData

    const t0 = performance.now()

    const inputValues = await resolveInputVariables(context, [languageModelInputVariable])
    const languageModel = inputValues[languageModelInputVariable.id] as LanguageModel

    const outputFunctionSchema = {
        name: FN_NAME,
        description: `
      You are an AI system designed to extract structured information from unstructured text.
      Given the input_text, return an ARRAY of JSON objects, each with the predefined keys based on the expected structure.
      ...
    `,
        parameters: {
            type: 'object',
            properties: {
                result: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            ...outputSchemaInputVariable.value,
                        },
                        required: Object.keys(outputSchemaInputVariable.value),
                    },
                    description: '提取的结构化数据数组',
                },
            },
            required: ['result'],
        },
    }

    const llmWithFunction = (languageModel.model as ChatOpenAI).bind({
        functions: [outputFunctionSchema],
        function_call: { name: FN_NAME },
    })

    const runnablePrompt = RunnableSequence.from([
        llmWithFunction,
        new JsonOutputFunctionsParser(),
    ])

    const result = await runnablePrompt.invoke(languageModel.messages) as { result: any[] }
    const outputArr = result?.result ?? []

    const elapsed = performance.now() - t0

    writeLogs(
        context,
        node.id,
        node.data.title,
        node.data.type,
        {
            [listOutputVariable.id]: {
                content: outputArr,
                outputPort: listOutputVariable,
                elapsed,
            },
        },
        elapsed
    )

    return {
        [listOutputVariable.id]: outputArr,
    }
}
