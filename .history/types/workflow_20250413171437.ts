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

}

export type BuildContext = Record<string, any>

// 👇 工厂函数中我们明确用 LangFlowNode
export type NodeFactory = (node: FlowNode, context: BuildContext) => Promise<any>
