import type { BuildContext, FlowNode, NodeMeta } from '~/types/workflow'

export async function llmChainFactory(node: FlowNode, context: BuildContext) {
  const prompt = context[node.data.promptNodeId]
  const llm = context[node.data.llmNodeId]

  if (!prompt || !llm) {
    throw new Error('LLMChain (pipe): Missing prompt or llm dependency')
  }

  return prompt.pipe(llm) // ✅ 使用 LCEL 替代 LLMChain
}

export const llmChainMeta: NodeMeta = {
  type: 'LLMChain',
  label: 'LLM Chain (Pipe)',
  icon: '🔗',
  description: 'Chains a prompt with an LLM using .pipe() (LCEL)',
  fields: [
    {
      name: 'promptNodeId',
      label: 'Prompt Node ID',
      type: 'string',
      required: true,
    },
    {
      name: 'llmNodeId',
      label: 'LLM Node ID',
      type: 'string',
      required: true,
    },
  ],
}
