
import type { LangFlowNode, BuildContext, } from '~~/types/workflow'
import { resolveInputVariables, writeLogs } from '../utils'
import type { SubWorkflowData } from '~~/types/node-data/sub-workflow'

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
        userIdInputVariable

    } = data

    // 解析全部输入端口
    const inputValues = await resolveInputVariables(context, [
        urlInputVariable,
        tokenInputVariable,
        userIdInputVariable,
        ...bodyInputVariable
    ])

    const url = inputValues[urlInputVariable.id]
    const token = inputValues[tokenInputVariable.id]
    const userId = inputValues[data.userIdInputVariable.id]
    // console.log('SubWorkflow ', data)
    // console.log('SubWorkflow userId:', userId)

    if (!url) {
        throw new Error('SubWorkflow 节点需要一个有效的 URL')
    }
    let result = {}
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        if (userId) headers['Torra-User-Id'] = userId

        const body: Record<string, any> = {}
        for (const inputVariable of bodyInputVariable) {
            body[inputVariable.name] = inputValues[inputVariable.id]
        }

        // console.log('SubWorkflow 请求 headers:', headers)
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        })
        // console.log('SubWorkflow 请求 body:', body)
        if (!response.ok) {
            const errorText = await response.text()
            return { error: `HTTP ${response.status} ${response.statusText}`, details: errorText }
        }



        result = await response.text()
        // console.log('SubWorkflow 请求结果:', result)

    } catch (err: any) {
        // return { error: err.message || '请求失败' }
        console.error('SubWorkflow 请求失败:', err)
        throw new Error(`SubWorkflow 请求失败: ${err.message || '未知错误'}`)
    }

    const elapsed = performance.now() - t0



    writeLogs(context, node.id, data.title, data.type, {
        [dataOutputVariable.id]: {
            content: {
                type: 'sub-workflow',
                data: result
            },
            outputPort: dataOutputVariable,
            elapsed // 这里可以计算实际耗时
        }
    }, elapsed)

    return {
        [dataOutputVariable.id]: result
    }
}
