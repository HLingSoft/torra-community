import type {

  WSErrorMessage,
  WSExecuteDoneMessage,
  WSExecuteProgressMessage,
  WSExecuteRunMessage,
  WSMessage,
} from '~/types/ws'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { executeDAG } from '~/server/langchain/builder'
import { LangFlowJson, DAGStepInfo } from '~/types/workflow'
import type { WebSocket } from 'ws'
import * as _ from 'lodash-es'

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV === 'prerender') {
    return
  }

  const server = createServer()
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (raw: WebSocket.Data) => {
      try {
        const msg: WSExecuteRunMessage = JSON.parse(raw.toString())

        if (isWithNamespace(msg) && msg.namespace === 'execute' && msg.type === 'run') {

          const langflowJson: LangFlowJson = {
            nodes: _.cloneDeep(msg.workflow.nodes),
            edges: _.cloneDeep(msg.workflow.edges)
          }


          const res = await executeDAG(langflowJson, msg.input.message, 'chat', {
            onStep: (step: DAGStepInfo) => {
              const progressMsg: WSExecuteProgressMessage = {
                namespace: 'execute',
                type: 'progress',
                data: step,
              }
              ws.send(JSON.stringify(progressMsg))
            },
          })


          const doneMsg: WSExecuteDoneMessage = {
            namespace: 'execute',
            type: 'done',
            data: {
              output: res.output,
              logs: res.logs,
              statusCode: res.statusCode,
              results: res.results,
              errorNodeId: res.errorNodeId,
              errorType: res.errorType,
              errorMessage: res.errorMessage,

            },
          }
          ws.send(JSON.stringify(doneMsg))
        }
      }
      catch (e: any) {
        const errorMsg: WSErrorMessage = {
          type: 'error',
          message: e.message,
          stack: e.stack,
        }
        ws.send(JSON.stringify(errorMsg))
      }
    })

    ws.on('close', () => {
      console.log('🔴 WebSocket disconnected')
    })
  })

  const port = 3001
  server.listen(port, () => {
    console.log(`✅ WebSocket Server is running on ws://localhost:${port}`)
  })
})

function isWithNamespace(msg: WSMessage): msg is Extract<WSMessage, { namespace: string }> {
  return typeof msg === 'object' && msg !== null && 'namespace' in msg
}
