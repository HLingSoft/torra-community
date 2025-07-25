
import type { LangFlowNode, BuildContext } from '~~/types/workflow'
import { resolveInputVariables, writeLogs } from '../utils'
import type { APIRequestData } from '~~/types/node-data/api-request'


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
    let result = ''
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
            options.body = typeof body === 'string'
                ? body                 // 已经是最终 JSON，直接用
                : JSON.stringify(body) // 还不是，序列化一次
        }
        // console.log(url, method, body, token)
        // console.log(options)

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


        result = await res.text()

    } catch (err: any) {
        console.error('API 请求失败:', err)
        result = err.message
    }



    const elapsed = performance.now() - t0
    writeLogs(context, node.id, data.title, data.type, {
        [data.dataOutputVariable.id]: {
            content: result,
            outputPort: data.dataOutputVariable,
            elapsed: elapsed,
        }
    }, elapsed)

    return {
        [dataOutputVariable.id]: result,
    }
}
