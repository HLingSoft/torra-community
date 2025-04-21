// types/ws.ts

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
  workflow: any // 建议替换为 WorkflowJSON
  input: {
    message: string
  }
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
    output: string
  }
}

// ✅ 系统消息结构

export interface WSWelcomeMessage {
  type: 'welcome'
  clientId: string
}

export interface WSErrorMessage {
  type: 'error'
  message: string
  stack?: string
}

export interface DAGStepInfo {
  index: number
  total: number
  nodeId: string
  type: string
  output: any
  outputPreview: string
  elapsed: number
  elapsedStr: string
}

export type ServerMessage = WSExecuteProgressMessage | WSExecuteDoneMessage | WSErrorMessage
