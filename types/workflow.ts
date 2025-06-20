
/* ------------------------------------------------------------------ *
 *  类型定义示例（如已在其它文件定义，可删除以下内容）                *
 * ------------------------------------------------------------------ */
export interface LangFlowEdge {
  id: string
  source: string
  sourceHandle?: string
  target: string
  targetHandle?: string
}

export interface LangFlowNode {
  id: string
  data: any
}

/** 保存 VueFlow 的原始 JSON */
export interface LangFlowJson {
  nodes: LangFlowNode[]
  edges: LangFlowEdge[]
}

export interface DAGContext {
  inputMessage: string
  runType: 'chat' | 'api'
  results: Record<string, unknown>
}

// export interface DAGStepInfo {
//   nodeId: string
//   nodeType: string
//   output: unknown
//   startTime: number
//   endTime: number
//   duration: number
// }

export interface ExecuteDAGOptions {
  onStep?: (step: DAGStepInfo) => void
  maxLoopIterations?: number
}

export interface DAGStepInfo {
  index: number
  total: number
  nodeId: string
  nodeTitle: string
  type: string
  output: any
  // outputPreview: string
  elapsed: number
  elapsedStr: string
}

export interface InputPortVariable {
  id: string
  value: any
  name: string
  connected: boolean
  allowedTypes: string[]
  defaultValue?: any
  // forceStringify?: boolean // 是否强制转成字符串

}

export interface OutputPortVariable {
  id: string
  value: any
  name: string
  outputType: string // 当前节点类型
  connected: boolean

  show?: boolean // 是否显示

}

export type KeyValueSchema = Record<
  string,
  {
    name: string
    description: string
    defaultValue: any
    type: string
    value?: any
  }
>
export interface DAGRunResult {
  statusCode: number
  results: Record<string, any>
  logs: DAGStepInfo[]
  output: any
  errorNodeId?: string
  errorType?: string
  errorMessage?: string
}
// export type BuildContext = Record<string, any>
export type NodeResultsMap = Record<string, Record<string, any>>
export interface BuildContext {
  logs: NodeResultsMap,
  resolvedInput: Record<string, any>
  results: NodeResultsMap
  json: LangFlowJson
  /** 由 executeDAG 注入，用来回写真实耗时 */
  onRunnableElapsed?: (nodeId: string, ms: number) => void
}

// 👇 工厂函数中我们明确用 LangFlowNode
export type NodeFactory = (node: LangFlowNode, context: BuildContext) => Promise<any>

