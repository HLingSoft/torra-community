import type { FlowNode, BuildContext } from '~/types/workflow'
import type { IDGeneratorData } from '@/types/node-data/id-generator'
import { writeLog } from '../resolveInput'


export async function iDGeneratorFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as IDGeneratorData

  // 👇 从 data 中取出 inputValue（你在 Vue 里赋值了）
  const { inputValue, outputVariable } = data

  writeLog(
    context,
    node.id,
    outputVariable.id,
    `${inputValue}`,

  )


  return {
    [outputVariable.id]: inputValue,

  }
}
