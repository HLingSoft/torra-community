import type { LangFlowJson } from '~/types/workflow'

export function generateLangFlowJSONFromVueFlow(workflow: any): LangFlowJson {
  const langflowNodes: Record<string, any> = {}

  for (const node of workflow.nodes) {
    const inputs: Record<string, string> = {}

    for (const edge of workflow.edges) {
      if (edge.target === node.id) {
        const inputKey = edge.target
        inputs[inputKey] = edge.source
      }
    }

    langflowNodes[node.id] = {
      id: node.id,
      type: node.type,
      data: {
        ...node.data,
        parentNode: (node as any).parentNode || null, // 👈 👈 👈 关键：保留 parentNode
      },
    }
  }

  return { nodes: langflowNodes, edges: workflow.edges }
}
