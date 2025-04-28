import type { FlowNode, BuildContext } from '~/types/workflow'
import type { IDGeneratorData } from '@/types/node-data/id-generator'


export async function iDGeneratorFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as IDGeneratorData

  // 👇 从 data 中取出 inputValue（你在 Vue 里赋值了）
  const { inputValue, outputVariable } = data



  return {
    [outputVariable.id]: inputValue
  }
}
