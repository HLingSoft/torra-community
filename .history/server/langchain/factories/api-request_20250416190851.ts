import { RunnableLambda } from '@langchain/core/runnables'
import type { FlowNode, BuildContext } from '~/types/workflow'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { APIRequestData } from '~/types/node-data/api-request'

export async function apiRequestFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as APIRequestData

  const {
    methodType,
    urlInputVariable,
    body,
    dataOutputVariable,
    dataFrameOutputVariable,
  } = data

  // 解析 URL
  const inputValues = await resolveInputVariables(context, [urlInputVariable!])
  const url = inputValues[urlInputVariable!.name]

  // 构造请求的 Runnable
  const requestChain = RunnableLambda.from(async () => {
    try {
      const response = await fetch(url, {
        method: methodType,
        headers: {
          'Content-Type': 'application/json',
        },
        body: methodType !== 'GET' ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { error: `HTTP ${response.status} ${response.statusText}`, details: errorText }
      }

      const result = await response.json()

      // 如果是表格结构（数组 of 对象），可作为 dataframe 使用
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
    [dataOutputVariable.id]: requestChain.pipe((res) => res.raw ?? res),
    [dataFrameOutputVariable.id]: requestChain.pipe((res) => res.table ?? []),
  }
}
