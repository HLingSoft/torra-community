

import { executeDAG } from '~/server/langchain/builder'
import { LangFlowJson, DAGStepInfo } from '~/types/workflow'


import * as _ from 'lodash-es'
import { useJSONStringify } from '~/composables'
export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, message: 'Missing or invalid Authorization header' })
    }

    //社区版 不做校验
    const token = authHeader.replace('Bearer ', '')
    const userId = getHeader(event, "X-User-ID");
    console.log('API Token:', token, 'User ID:', userId);






    const body = await readBody(event)
    const { workflow, input } = body

    if (!workflow || !input) {
      return {
        statusCode: 400,
        error: 'Missing workflow or input'
      }
    }




    const langflowJson: LangFlowJson = {
      nodes: _.cloneDeep(workflow.nodes),
      edges: _.cloneDeep(workflow.edges)
    }

    const res = await executeDAG(langflowJson, input, 'api', userId ?? '', workflow.objectId, {
      onStep: (step: DAGStepInfo) => {
        console.log('API  DAG Step Info:', step)
      },
    })
    console.log('API 运行结果:', res)


    return {
      statusCode: res.statusCode || 200,
      output: res.output,
      logs: res.logs,
      errorNodeId: res.errorNodeId,
      errorType: res.errorType,
      errorMessage: res.errorMessage
    }

  } catch (e: any) {
    console.error('API 运行错误', e)
    return {
      statusCode: 500,
      error: e.message,
      output: e.message,

    }
  }
})

