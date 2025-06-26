import { LC } from '~/composables'
import { executeDAG } from '~/server/langchain/builder'
import { LangFlowJson, DAGStepInfo } from '~/types/workflow'
// import { generateLangFlowJSONFromVueFlow } from '~/server/langchain/transformer'
import WorkflowRunLog from '~/models/WorkflowRunLog'
import Workflow, { EnumWorkflow } from '~/models/Workflow'
import { toJsonSafe } from '~/server/langchain/utils'
import User from '~/models/User'
import * as _ from 'lodash-es'
export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, message: 'Missing or invalid Authorization header' })
    }
    // const userId = getHeader(event, "X-User-ID");

    // if (!userId) {
    //   throw createError({ statusCode: 401, message: "Missing X-User-ID header" });
    // }


    const token = authHeader.replace('Bearer ', '')
    // console.log('API 运行开始', userId, token)

    const workflow = await new LC.Query(Workflow).equalTo(EnumWorkflow.TOKEN, token).first()
    if (!workflow) {
      throw createError({ statusCode: 404, message: 'Workflow not found for given token' })
    }

    const user = await new LC.Query(User).get('66ed3a6cc00ed65838d86172')
    // const user = await new LC.Query(User).get(userId)
    // if (!user) {
    //   throw createError({ statusCode: 404, message: 'User not found ' })
    // }


    const body = await readBody(event)

    const input = JSON.stringify(body)


    if (!input) {
      return {
        statusCode: 400,
        body: { error: 'Missing workflow or input message' }
      }
    }

    const langflowJson: LangFlowJson = {
      nodes: _.cloneDeep(workflow.nodes),
      edges: _.cloneDeep(workflow.edges)
    }
    console.log('API 运行 开始执行 executeDAG', user.objectId, workflow.objectId)

    const res = await executeDAG(langflowJson, input, 'api', user.objectId, workflow.objectId, {
      onStep: (step: DAGStepInfo) => {
        console.log('API  DAG Step Info:', step)
      },
    })


    const workflowRunLog = new WorkflowRunLog()
    workflowRunLog.workflow = workflow
    workflowRunLog.name = workflow.name
    workflowRunLog.logs = res.logs;
    workflowRunLog.channel = 'api'
    workflowRunLog.result = res.output
    workflowRunLog.times = res.logs.reduce((sum, log) => {
      let elapsed = log.elapsed
      if (elapsed > 0) {
        return sum + elapsed
      }
      return sum
    }, 0)
    await workflowRunLog.save()
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
