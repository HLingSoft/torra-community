import type { ListOutputData } from '~~/types/node-data/list-output'
import type {
    BuildContext,
    LangFlowNode,
} from '~~/types/workflow'

import { JsonOutputFunctionsParser } from 'langchain/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import type { BaseMessage } from '@langchain/core/messages'
import { resolveInputVariables, writeLogs } from '../utils'
import { useJSONStringify } from '~/composables'
interface LanguageModel {
    model: ChatOpenAI
    messages: BaseMessage[]
}

const FN_NAME = 'extract_listed_data'

export async function listOutputFactory(
    node: LangFlowNode,
    context: BuildContext
) {

    try {
        const t0 = performance.now()
        const {
            languageModelInputVariable,
            outputSchemaInputVariable,
            listOutputVariable,
        } = node.data as ListOutputData



        const inputValues = await resolveInputVariables(context, [languageModelInputVariable])
        // console.log('listOutput inputValues', inputValues)
        const languageModel = inputValues[languageModelInputVariable.id] as LanguageModel
        if (!languageModel || !languageModel.model) {
            throw new Error('未提供有效的语言模型')
        }

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

        const runnable = RunnableSequence.from([
            llmWithFunction,
            new JsonOutputFunctionsParser(),
        ])

        const result = await runnable.invoke(languageModel.messages) as { result: any[] }
        const outputArr = result?.result ?? []
        // console.log('listoutput', outputArr)
        const elapsed = performance.now() - t0

        writeLogs(
            context,
            node.id,
            node.data.title,
            node.data.type,
            {
                [listOutputVariable.id]: {
                    content: useJSONStringify(outputArr).slice(0, 200) + '...(内容过长已截断)',
                    outputPort: listOutputVariable,
                    elapsed,
                },
            },
            elapsed
        )

        return {
            [listOutputVariable.id]: outputArr,
        }
    } catch (error: any) {
        console.error(`ListOutput ${node.id} Error:`, error)
        throw new Error(`ListOutput 生成失败: ${error.message}`)

    }

}
