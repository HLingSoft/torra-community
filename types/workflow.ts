
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

export interface ExecuteDAGOptions {
  onStep?: (step: DAGStepInfo) => void
  maxLoopIterations?: number
}

export interface DAGStepInfo {
  index: number
  total: number
  nodeId: string
  nodeTitle: string
  nodeType: string
  ports: {
    portId: string
    elapsed: number
    elapsedStr: string
    content: any
    timestamp: number
  }[]
  error?: string
  elapsed: number // 当前节点总耗时
  // ✅ 可选新增字段，表示 Loop 上下文信息
  loopContext?: {
    loopNodeId: string;
    loopNodeTitle: string;
    currentItemIndex: number;
    currentItemValue: unknown;
  };
}

export interface InputPortVariable {
  id: string
  value: any
  name: string
  connected: boolean
  allowedTypes: string[]
  defaultValue?: any


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


export interface PortLog {
  content: any
  outputPort: OutputPortVariable // 输出端口
  elapsed?: number // 耗时，单位毫秒
  timestamp?: number // 日志时间戳，单位毫秒
}

export interface DAGRunResult {
  statusCode: number
  results: Record<string, any>
  logs: DAGStepInfo[]
  output: any
  errorNodeId?: string
  errorType?: string
  errorMessage?: string
}

export type NodeResultsMap = Record<string, Record<string, any>>
export interface BuildContext {
  userId: string
  variables: Record<string, any>[]
  workflowId: string

  logs: NodeResultsMap,
  resolvedInput: Record<string, any>
  results: NodeResultsMap
  json: LangFlowJson
  /** 由 executeDAG 注入，用来回写真实耗时 */
  onRunnableElapsed?: (nodeId: string, ms: number) => void
  onStep?: (stepInfo: DAGStepInfo) => void  // ✅ 新增此回调
}

// 👇 工厂函数中我们明确用 LangFlowNode
export type NodeFactory = (node: LangFlowNode, context: BuildContext) => Promise<any>

