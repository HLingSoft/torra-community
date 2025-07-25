// types/ws.ts

import type Workflow from "~~/models/Workflow"
import type { DAGStepInfo } from "~~/types/workflow"
export type WSNamespace = 'execute' | 'chat' | 'status'

export type WSMessage =
  | WSExecuteRunMessage
  | WSExecuteProgressMessage
  | WSExecuteDoneMessage
  | WSErrorMessage
  | WSWelcomeMessage

// ✅ 业务消息结构（execute）

export interface WSExecuteRunMessage {
  namespace: 'execute'
  type: 'run'
  workflow: Workflow // 建议替换为 WorkflowJSON
  input: {
    message: string
  },
  userId: string
  workflowId: string
}
export interface LogNode {
  nodeId: string
  name: string
  inputs: Record<string, any>   // portId -> 值
  outputs: Record<string, any>  // portId -> 值
  elapsed: number
}
export interface WSExecuteProgressMessage {
  namespace: 'execute'
  type: 'progress'
  data: DAGStepInfo
}

export interface WSExecuteDoneMessage {
  namespace: 'execute'
  type: 'done'
  data: {
    output: string,
    logs: DAGStepInfo[]
    statusCode: number
    // results: Record<string, any>
    errorNodeId?: string
    errorType?: string
    errorMessage?: string
  }
}

// ✅ 系统消息结构

export interface WSWelcomeMessage {
  namespace: 'status'
  type: 'welcome'
  clientId: string
}

export interface WSErrorMessage {
  namespace: 'status'
  type: 'error'
  message: string
  stack?: string
}



export type ServerMessage = WSExecuteProgressMessage | WSExecuteDoneMessage | WSErrorMessage
