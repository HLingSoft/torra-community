import { LC } from '~/composables'
import { executeDAG } from '~/server/langchain/builder'
import { generateLangFlowJSONFromVueFlow } from '~/server/langchain/transformer'
import WorkflowRunLog from '~/models/WorkflowRunLog'
import Workflow, { EnumWorkflow } from '~/models/Workflow'
import type {
  DAGStepInfo,

} from '~/types/ws'
export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, message: 'Missing or invalid Authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')

    const workflow = await new LC.Query(Workflow).equalTo(EnumWorkflow.TOKEN, token).first()
    if (!workflow) {
      throw createError({ statusCode: 404, message: 'Workflow not found for given token' })
    }

    const body = await readBody(event)
    const input = JSON.stringify(body)
    console.log('input', input)

    if (!input) {
      return {
        statusCode: 400,
        body: { error: 'Missing workflow or input message' }
      }
    }

    const langflowJson = generateLangFlowJSONFromVueFlow(workflow)

    // const steps: DAGStepInfo[] = []
    const res = await executeDAG(langflowJson, input, 'api', {
      onStep: (step: DAGStepInfo) => {
        // console.log('onStep', step)
      },
    })
    const workflowRunLog = new WorkflowRunLog()
    workflowRunLog.workflow = workflow
    workflowRunLog.name = workflow.name
    workflowRunLog.logs = res.logs
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
      statusCode: 200,
      output: res.output,
      logs: res.logs,
    }
  } catch (e: any) {
    return {
      statusCode: 500,
      error: e.message,
      output: ''
      // stack: e.stack
    }
  }
})
