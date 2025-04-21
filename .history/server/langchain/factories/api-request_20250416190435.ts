import { RunnableLambda } from '@langchain/core/runnables'
import type { FlowNode, BuildContext } from '~/types/workflow'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { APIRequestData } from '~/types/node-data/api-request' // 你定义的接口

export async function apiRequestFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as APIRequestData

  const {
    methodType,
    urlInputVariable,
    body,
    dataOutputVariable,
    dataFrameOutputVariable,
  } = data

  // 获取 URL 输入
  const inputValues = await resolveInputVariables(context, [urlInputVariable!])
  const url = inputValues[urlInputVariable!.name]

  // 构造可执行请求的 LangChain Runnable
  const requestChain = RunnableLambda.from(async () => {
    const response = await fetch(url, {
      method: methodType,
      headers: {
        'Content-Type': 'application/json',
      },
      body: methodType !== 'GET' ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP 请求失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return result
  })

  return {
    [dataOutputVariable.id]: requestChain,
    [dataFrameOutputVariable.id]: requestChain,
  }
}
