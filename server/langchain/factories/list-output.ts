import type { ListOutputData } from '@/types/node-data/list-output'
import type {
    BuildContext,
    LangFlowNode,
    InputPortVariable
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
const FN_NAME = 'extract_listed_data';
/**
 * ListOutput 节点工厂函数
 */
export async function listOutputFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const {
        languageModelInputVariable,
        outputSchemaInputVariable,
        listOutputVariable
    } = node.data as ListOutputData

    const variableDefs = [languageModelInputVariable] as InputPortVariable[]
    const inputValues = await resolveInputVariables(context, variableDefs)

    const languageModel = inputValues[languageModelInputVariable.id] as LanguageModel

    const outputFunctionSchema = {
        name: FN_NAME,
        description: `
      You are an AI system designed to extract structured information from unstructured text.
      Given the input_text, return an ARRAY of JSON objects, each with the predefined keys based on the expected structure.
      Extract values accurately and format them according to the specified type (e.g., string, integer, float, date).
      If a value is missing or cannot be determined, return a default (e.g., null, 0, or 'N/A').
      If multiple instances of the expected structure exist within the input_text, return each as a separate JSON object in the array.
      Return only the JSON array, do not include any explanations.
    `,
        parameters: {
            type: 'object',
            properties: {
                result: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            ...outputSchemaInputVariable.value
                        },
                        required: Object.keys(outputSchemaInputVariable.value)
                    },
                    description: '提取的结构化数据数组'
                }
            },
            required: ['result']
        }
    }

    const llmWithFunction = (languageModel.model as ChatOpenAI).bind({
        functions: [outputFunctionSchema],
        function_call: { name: FN_NAME }
    })

    const runnablePrompt = RunnableSequence.from([
        llmWithFunction,
        new JsonOutputFunctionsParser()
    ])

    const result = await runnablePrompt.invoke(languageModel.messages) as {
        result: any[]
    }

    const outputArr = result?.result ?? []


    return {
        [listOutputVariable.id]: outputArr
    }
}
