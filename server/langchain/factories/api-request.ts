import { RunnableLambda } from '@langchain/core/runnables'
import type { LangFlowNode, BuildContext } from '~/types/workflow'
import { resolveInputVariables, wrapRunnable } from '../../langchain/resolveInput'
import type { APIRequestData } from '~/types/node-data/api-request'

export async function apiRequestFactory(node: LangFlowNode, context: BuildContext) {
    /* ---------- 1. 类型与变量准备 ---------- */
    const data = node.data as APIRequestData
    const {
        methodType,
        urlInputVariable,
        bodyInputVariable,
        tokenInputVariable,
        dataOutputVariable,

    } = data

    /* ---------- 2. 解析 URL、Body 和 Token ---------- */
    const inputValues = await resolveInputVariables(context, [
        urlInputVariable,
        bodyInputVariable,
        tokenInputVariable,
    ])

    const url = inputValues[urlInputVariable.id]
    const body = inputValues[bodyInputVariable.id]
    const token = inputValues[tokenInputVariable.id]
    const method = methodType.toLowerCase()

    /* ---------- 3. 构造 API 请求 runnable ---------- */
    const requestChain = RunnableLambda.from(async () => {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const options: RequestInit = {
                method,
                headers,
            }

            if (method !== 'get') {
                options.body = JSON.stringify(body)
            }

            const res = await fetch(url, options)
            if (!res.ok) {
                const errorText = await res.text()

                return {
                    raw: {
                        error: `HTTP ${res.status} ${res.statusText}`,
                        details: errorText,
                    }
                }
            }
            //  const result = await res.json()
            const result = await res.text()
            return {
                raw: result,

            }

        } catch (err: any) {
            console.error('API 请求失败:', err)
            return {
                raw: err.message,
            }
        }
    })

    /* ---------- 4. 包装延迟执行对象 ---------- */
    const wrappedRaw = wrapRunnable(
        requestChain.pipe(r => r.raw ?? ''),
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: dataOutputVariable.id,
            logFormat: res => ({ type: 'api-request Chain', data: res }),
        },
    )



    /* ---------- 5. 返回封装结果 ---------- */
    return {
        [dataOutputVariable.id]: wrappedRaw,

    }
}
