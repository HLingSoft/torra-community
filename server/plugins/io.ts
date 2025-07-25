
import type {

    WSErrorMessage,
    WSExecuteDoneMessage,
    WSExecuteProgressMessage,
    WSExecuteRunMessage,
    WSMessage,
} from '~~/types/ws'
import { LC } from '~/composables'
import User from '~~/models/User'
import UserWorkflowVariable, { EnumUserWorkflowVariable } from '~~/models/UserWorkflowVariable'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { executeDAG } from '~~/server/langchain/builder'
import { LangFlowJson, DAGStepInfo } from '~~/types/workflow'
import type { WebSocket } from 'ws'
import * as _ from 'lodash-es'
import { useJSONStringify } from '~/composables'
// import { generateLangFlowJSONFromVueFlow } from '~~/server/langchain/transformer'

export default defineNitroPlugin(() => {
    if (process.env.NODE_ENV === 'prerender') {
        return
    }
    const HEARTBEAT_INTERVAL = 5_000    // 

    const server = createServer()
    const wss = new WebSocketServer({ server })

    wss.on('connection', (ws: WebSocket) => {
        /* 每条连接的存活标记 */
        // @ts-ignore 扩展属性
        ws.isAlive = true

        /* 收到 PONG → 说明对端还活着 */
        ws.on('pong', () => {
            // @ts-ignore
            ws.isAlive = true
        })
        /* 定时器：先标记为“假死”，再发 PING */
        const pingTimer = setInterval(() => {
            // @ts-ignore
            if (!ws.isAlive) {
                console.log('❌ No PONG – terminating stale connection')
                clearInterval(pingTimer)
                return ws.terminate()
            }

            // @ts-ignore
            ws.isAlive = false
            ws.ping()

            // ✅ 主动往客户端发点内容，维持连接活跃
            try {
                ws.send(JSON.stringify({ type: 'pong' }))
            } catch (e) {
                console.warn('🔥 Heartbeat send failed:', e)
            }
        }, HEARTBEAT_INTERVAL)
        ws.on('message', async (raw: WebSocket.Data) => {
            try {
                const msg: WSMessage = JSON.parse(raw.toString())
                // console.log('📩 Received message:', msg)

                if (isWithNamespace(msg) && msg.namespace === 'execute' && msg.type === 'run') {
                    const runMsg = msg as WSExecuteRunMessage
                    const langflowJson: LangFlowJson = {
                        nodes: _.cloneDeep(runMsg.workflow.nodes),
                        edges: _.cloneDeep(runMsg.workflow.edges)
                    }
                    const userWorkflowVariables = await new LC.Query(UserWorkflowVariable)
                        .equalTo(EnumUserWorkflowVariable.USER, LC.Object.createWithoutData(User, msg.userId))
                        .first()

                    if (!userWorkflowVariables) {
                        const errorMsg: WSErrorMessage = {
                            namespace: 'status',
                            type: 'error',
                            message: 'User workflow variables not found',
                        }
                        ws.send(useJSONStringify(errorMsg))
                        return
                    }

                    const res = await executeDAG(langflowJson, runMsg.input.message, 'chat', userWorkflowVariables.variables, msg.userId, msg.workflowId, {
                        onStep: (step: DAGStepInfo) => {
                            const progressMsg: WSExecuteProgressMessage = {
                                namespace: 'execute',
                                type: 'progress',
                                data: step
                            }
                            ws.send(useJSONStringify(progressMsg)) // 限制消息大小，避免过大导致问题
                        },
                    })


                    const doneMsg: WSExecuteDoneMessage = {
                        namespace: 'execute',
                        type: 'done',
                        data: {
                            output: res.output.slice(0, 2000),
                            logs: res.logs,
                            statusCode: res.statusCode,

                            errorNodeId: res.errorNodeId,
                            errorType: res.errorType,
                            errorMessage: res.errorMessage,

                        },
                    }

                    ws.send(useJSONStringify(doneMsg))
                }
            }
            catch (e: any) {
                const errorMsg: WSErrorMessage = {
                    namespace: 'status',
                    type: 'error',
                    message: e.message,
                    stack: e.stack,
                }
                ws.send(useJSONStringify(errorMsg))
            }
        })

        ws.on('close', () => {
            clearInterval(pingTimer)
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
