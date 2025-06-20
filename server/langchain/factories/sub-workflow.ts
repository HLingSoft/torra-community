import { RunnableLambda } from '@langchain/core/runnables'
import type { LangFlowNode, BuildContext, InputPortVariable } from '~/types/workflow'
import { resolveInputVariables, wrapRunnable } from '../../langchain/resolveInput'
import type { SubWorkflowData } from '~/types/node-data/sub-workflow'

/**
 * SubWorkflow 节点工厂函数
 * 支持延迟执行/日志/变量解析等
 */
export async function subWorkflowFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const data = node.data as SubWorkflowData


    const {
        urlInputVariable,
        bodyInputVariable,
        dataOutputVariable,
        tokenInputVariable
    } = data


    // 解析全部输入端口（url/token/body的每个端口都传进来）
    const inputValues = await resolveInputVariables(context, [
        urlInputVariable,
        tokenInputVariable,
        ...bodyInputVariable
    ])
    // console.log('[SubWorkflow] factory → 2', node.id, inputValues)
    const url = inputValues[urlInputVariable.id]
    const token = inputValues[tokenInputVariable.id]

    // 懒执行请求链
    const requestChain = RunnableLambda.from(async () => {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            const requestOptions: RequestInit = {
                method: 'POST',
                headers
            }

            // bodyInputVariable 可能是多个输入端口，组装成对象
            const body: Record<string, any> = {}
            for (const inputVariable of bodyInputVariable) {

                // const variableName = inputVariable.id
                // await resolveInputVariables(context, [inputVariable])
                const variableValue = inputValues[inputVariable.id]
                body[inputVariable.name] = variableValue
            }
            requestOptions.body = JSON.stringify(body)
            // console.log('[SubWorkflow] factory → 1', node.id, '请求体:', requestOptions.body)

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

    // 延迟执行包装，日志格式也保持你的风格


    const wrapped = wrapRunnable(
        requestChain.pipe(res => res.raw ?? res),
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: dataOutputVariable.id,
            logFormat: (res) => ({
                type: 'sub-workflow',
                data: res,
            })
        }
    )

    return {
        [dataOutputVariable.id]: await wrapped.invokeIfAvailable() as any,
    }
}
