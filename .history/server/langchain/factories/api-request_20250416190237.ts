import axios from 'axios'
import { RunnableLambda } from '@langchain/core/runnables'
import type { FlowNode, BuildContext } from '~/types/workflow'
import { resolveInputVariables } from '../../langchain/resolveInput'
import type { APIRequestData } from '~/types/node-data/api-request' // ← 根据你实际路径调整

export async function apiRequestFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as APIRequestData

  const {
    methodType,
    urlInputVariable,
    body,
    dataOutputVariable,
    dataFrameOutputVariable,
  } = data

  // 解析 URL 输入变量
  const inputValues = await resolveInputVariables(context, [urlInputVariable!])
  const url = inputValues[urlInputVariable!.name]

  // 构造执行请求的 Runnable
  const requestChain = RunnableLambda.from(async () => {
    const response = await axios({
      url,
      method: methodType,
      data: body,
    })

    const result = response.data
    return result
  })

  // 返回两个端口输出
  return {
    [dataOutputVariable.id]: requestChain,
    [dataFrameOutputVariable.id]: requestChain, // 同样的数据，可用于结构化展示
  }
}
