import { RunnableLambda } from '@langchain/core/runnables'
import type { FlowNode, BuildContext } from '~/types/workflow'
import { resolveInputVariables, wrapRunnable } from '../../langchain/resolveInput'
import type { APIRequestData } from '~/types/node-data/api-request'

export async function apiRequestFactory(node: FlowNode, context: BuildContext) {
    const data = node.data as APIRequestData

    const {
        methodType,
        urlInputVariable,
        bodyVariable,
        dataOutputVariable,
        dataFrameOutputVariable,
        tokenVariable
    } = data
    // console.log(urlInputVariable)

    // 同时解析 URL 和 body
    const inputValues = await resolveInputVariables(context, [urlInputVariable, bodyVariable, tokenVariable])

    const url = inputValues[urlInputVariable.name]
    const body = inputValues[bodyVariable.name]
    const token = inputValues[data.tokenVariable.name]
    const method = methodType.toLocaleLowerCase()
    // console.log('url', url)
    // 构造请求链
    const requestChain = RunnableLambda.from(async () => {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            // 如果有 token，自动添加 Authorization 头
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const requestOptions: RequestInit = {
                method: method,
                headers
            }

            if (method.toLocaleLowerCase() !== 'get') {
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
        [dataOutputVariable.id]: wrapRunnable(
            (requestChain.pipe(res => res.raw ?? res)),                // runnable
            node.id,              // nodeId
            context.onRunnableElapsed, // 回调（可能是 undefined）
        ),
        [dataFrameOutputVariable.id]: wrapRunnable(
            requestChain.pipe(res => res.table ?? []),                // runnable
            node.id,              // nodeId
            context.onRunnableElapsed, // 回调（可能是 undefined）
        )
    }
}
