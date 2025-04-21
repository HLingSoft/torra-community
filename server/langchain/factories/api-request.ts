import { RunnableLambda } from '@langchain/core/runnables'
import type { FlowNode, BuildContext } from '~/types/workflow'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { APIRequestData } from '~/types/node-data/api-request'

export async function apiRequestFactory(node: FlowNode, context: BuildContext) {
    const data = node.data as APIRequestData

    const {
        methodType,
        urlInputVariable,
        bodyVariable,
        dataOutputVariable,
        dataFrameOutputVariable,
    } = data

    // 同时解析 URL 和 body
    const inputValues = await resolveInputVariables(context, [urlInputVariable, bodyVariable])

    const url = inputValues[urlInputVariable.name]
    const body = inputValues[bodyVariable.name]

    // 构造请求链
    const requestChain = RunnableLambda.from(async () => {
        try {
            const requestOptions: RequestInit = {
                method: methodType,
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            if (methodType.toLocaleLowerCase() !== 'get') {
                requestOptions.body = JSON.stringify(body)
            }
            const response = await fetch(url, requestOptions)

            if (!response.ok) {
                const errorText = await response.text()
                return { error: `HTTP ${response.status} ${response.statusText}`, details: errorText }
            }

            const result = await response.json()
            const isArrayOfObjects = Array.isArray(result) && result.every(item => typeof item === 'object')

            return {
                raw: result,
                table: isArrayOfObjects ? result : [],
            }
        } catch (err: any) {
            return { error: err.message || '请求失败' }
        }
    })

    return {
        [dataOutputVariable.id]: requestChain.pipe(res => res.raw ?? res),
        [dataFrameOutputVariable.id]: requestChain.pipe(res => res.table ?? []),
    }
}
