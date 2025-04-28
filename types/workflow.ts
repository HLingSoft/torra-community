export interface FlowNode {
  id: string
  type: string
  data: Record<string, any>
  parentNode?: string // 👈 新加这个！
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  data: Record<string, any>
}

export interface LangFlowJson {
  nodes: Record<string, FlowNode>
  edges: FlowEdge[]
}

export interface InputPortVariable {
  id: string
  value: any
  name: string
  connected: boolean
  allowedTypes: string[]
  defaultValue?: any
  forceStringify?: boolean // 是否强制转成字符串
  sourcePortId?: string // 连接到我的输出端口 ID
  sourceNodeId?: string //  连接到我的节点 ID
  sourceNodeType?: string // 连接到我的节点类型

}

export interface OutputPortVariable {
  id: string
  value: any
  name: string
  outputType: string // 当前节点类型
  connected: boolean

  targetPortId?: string // 我连接到的输入端口 ID
  targetNodeId?: string // 我连接到的节点 ID
  targetNodeType?: string //  我连接到的节点类型
  show?: boolean // 是否显示

}

// export type BuildContext = Record<string, any>
export type NodeResultsMap = Record<string, Record<string, any>>
export interface BuildContext {
  resolvedInput: Record<string, any>
  results: NodeResultsMap
  json: LangFlowJson
  /** 由 executeDAG 注入，用来回写真实耗时 */
  onRunnableElapsed?: (nodeId: string, ms: number) => void
}

// 👇 工厂函数中我们明确用 LangFlowNode
export type NodeFactory = (node: FlowNode, context: BuildContext) => Promise<any>
