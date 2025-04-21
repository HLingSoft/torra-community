import { DynamicTool } from "langchain/tools"
import type { FlowNode, BuildContext, NodeMeta } from "~/types/workflow"

export async function toolFactory(node: FlowNode, context: BuildContext) {
  const chain = context[node.data.chainNodeId]

  if (!chain || typeof chain.call !== "function") {
    throw new Error("Tool: Invalid or missing chain reference")
  }

  return new DynamicTool({
    name: node.data.name || "UnnamedTool",
    description: node.data.description || "No description provided.",
    func: async (input: string) => {
      // 调用子链并取出结果（支持返回 text 或全对象）
      const result = await chain.call({ input })

      return result?.text || JSON.stringify(result)
    },
  })
}

export const toolMeta: NodeMeta = {
  type: "Tool",
  label: "Dynamic Tool",
  icon: "🛠️",
  description: "Wraps a chain or function as a Tool for Agent use",
  fields: [
    {
      name: "name",
      label: "Tool Name",
      type: "string",
      required: true,
      default: "MyTool",
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      required: true,
      default: "What this tool does",
    },
    {
      name: "chainNodeId",
      label: "Chain Node ID",
      type: "string",
      required: true,
      description: "The ID of the chain node this tool wraps",
    },
  ],
}
