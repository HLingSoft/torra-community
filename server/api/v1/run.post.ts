
import { executeDAG } from '~/server/langchain/builder'
import { LangFlowJson, DAGStepInfo } from '~/types/workflow'


import { toJsonSafe } from '~/server/langchain/resolveInput'
import * as _ from 'lodash-es'
export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, message: 'Missing or invalid Authorization header' })
    }

    //社区版 不做校验
    const token = authHeader.replace('Bearer ', '')
    console.log('API Token:', token)



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

    const res = await executeDAG(langflowJson, input, 'api', {
      onStep: (step: DAGStepInfo) => {
        console.log('Step executed:', step.nodeId, step.elapsed, step.output)
      },
    })


    // const workflowRunLog = new WorkflowRunLog()
    // workflowRunLog.workflow = workflow
    // workflowRunLog.name = workflow.name
    // workflowRunLog.logs = res.logs;
    // workflowRunLog.channel = 'api'
    // workflowRunLog.result = res.output
    // workflowRunLog.times = res.logs.reduce((sum, log) => {
    //   let elapsed = log.elapsed
    //   if (elapsed > 0) {
    //     return sum + elapsed
    //   }
    //   return sum
    // }, 0)
    // await workflowRunLog.save()
    return {
      statusCode: res.statusCode || 200,
      output: res.output,
      logs: res.logs,
      results: toJsonSafe(res.results),
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
