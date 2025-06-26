import { RunnableLambda } from '@langchain/core/runnables'
import type { LangFlowNode, BuildContext, InputPortVariable, OutputPortVariable } from '~/types/workflow'
import { resolveInputVariables, wrapRunnable } from '../utils'
import type { SubWorkflowData } from '~/types/node-data/sub-workflow'

/**
 * SubWorkflow 节点工厂函数
 * 支持延迟执行/日志/变量解析等
 */
export async function subWorkflowFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const t0 = performance.now()
    const data = node.data as SubWorkflowData

    const {
        urlInputVariable,
        bodyInputVariable,
        dataOutputVariable,
        tokenInputVariable,

    } = data

    // 解析全部输入端口
    const inputValues = await resolveInputVariables(context, [
        urlInputVariable,
        tokenInputVariable,
        ...bodyInputVariable
    ])

    const url = inputValues[urlInputVariable.id]
    const token = inputValues[tokenInputVariable.id]

    const requestChain = RunnableLambda.from(async () => {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const body: Record<string, any> = {}
            for (const inputVariable of bodyInputVariable) {
                body[inputVariable.name] = inputValues[inputVariable.id]
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                const errorText = await response.text()
                return { error: `HTTP ${response.status} ${response.statusText}`, details: errorText }
            }

            const result = await response.json()
            const isArrayOfObjects = Array.isArray(result) && result.every(item => typeof item === 'object')

            return {
                raw: result,
                table: isArrayOfObjects ? result : []
            }
        } catch (err: any) {
            return { error: err.message || '请求失败' }
        }
    })
    const elapsed = performance.now() - t0

    // 日志封装 + runnable 包装
    const wrapped = wrapRunnable(
        requestChain.pipe(res => res.raw ?? res),
        node.id,
        data.title,
        data.type,
        context.onRunnableElapsed,
        {
            context,
            portId: dataOutputVariable.id,

            logFormat: (res) => ({
                type: 'sub-workflow',
                data: res
            }),
            outputPort: data.dataOutputVariable,


        },


    )

    // 立即执行返回结果（保持语义）
    const result = await wrapped.invokeIfAvailable()

    return {
        [dataOutputVariable.id]: result
    }
}
