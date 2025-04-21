import type {
  DAGStepInfo,
  WSErrorMessage,
  WSExecuteDoneMessage,
  WSExecuteProgressMessage,
  WSExecuteRunMessage,
  WSMessage,
} from '~/types/ws'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { executeDAG } from '~/server/langchain/builder'
import type { WebSocket } from 'ws'
import { generateLangFlowJSONFromVueFlow } from '~/server/langchain/transformer'

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV === 'prerender') {
    return
  }

  const server = createServer()
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws:WebSocket) => {
    ws.on('message', async (raw:any) => {
      try {
        const msg: WSMessage = JSON.parse(raw.toString())
        // console.log('📩 Received message:', msg)

        if (isWithNamespace(msg) && msg.namespace === 'execute' && msg.type === 'run') {
          const runMsg = msg as WSExecuteRunMessage
          const langflowJson = generateLangFlowJSONFromVueFlow(runMsg.workflow)

          const res = await executeDAG(langflowJson, runMsg.input.message, {
            onStep: (step: DAGStepInfo) => {
              const progressMsg: WSExecuteProgressMessage = {
                namespace: 'execute',
                type: 'progress',
                data: step,
              }
              ws.send(JSON.stringify(progressMsg))
            },
          })
          console.log('🔄 DAG execution result:', res.output)

          const doneMsg: WSExecuteDoneMessage = {
            namespace: 'execute',
            type: 'done',
            data: {
              output: res.output,
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
