import { RunnableLambda } from '@langchain/core/runnables'
import type { LangFlowNode, BuildContext } from '~/types/workflow'
import { resolveInputVariables, wrapRunnable, writeLogs } from '../utils'
import type { APIRequestData } from '~/types/node-data/api-request'

export async function apiRequestFactory(node: LangFlowNode, context: BuildContext) {
    const t0 = performance.now()
    const data = node.data as APIRequestData
    const {
        methodType,
        urlInputVariable,
        bodyInputVariable,
        tokenInputVariable,
        dataOutputVariable,
    } = data

    const inputValues = await resolveInputVariables(context, [
        urlInputVariable,
        bodyInputVariable,
        tokenInputVariable,
    ])

    const url = inputValues[urlInputVariable.id]
    const body = inputValues[bodyInputVariable.id]
    const token = inputValues[tokenInputVariable.id]
    const method = methodType.toLowerCase()

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

    const wrapped = wrapRunnable(
        requestChain.pipe(r => r.raw ?? ''),
        node.id,

        {
            context,
            portId: dataOutputVariable.id,
            outputPort: dataOutputVariable, // ✅ 输出端口传入
            logFormat: res => ({ type: 'api-request', data: res }),
        }
    )
    const elapsed = performance.now() - t0
    writeLogs(context, node.id, data.title, data.type, {
        [data.dataOutputVariable.id]: {
            content: '',
            outputPort: data.dataOutputVariable,
            elapsed: elapsed,
        }
    }, elapsed)

    return {
        [dataOutputVariable.id]: wrapped,
    }
}
