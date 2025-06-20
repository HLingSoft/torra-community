import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { IfElseData } from '@/types/node-data/if-else'
import { MatchType } from '@/types/node-data/if-else'
import { resolveInputVariables, writeLog } from '../resolveInput'
import { InputPortVariable } from '~/types/workflow'

export const ifElseFactory = async (node: LangFlowNode, context: BuildContext) => {
  const data = node.data as IfElseData
  const {
    textInputVariable,
    matchType,
    matchTextInputVariable,
    messageInputVariable,
    operator,
    caseSensitive,
    trueOutputVariable,
    falseOutputVariable,
  } = data

  console.log(`[IfElse] Node ${node.id} ${node.data.title} started`, matchType)
  // -------- 解析输入 --------
  // 只在字符串模式下才传 matchTextInputVariable
  const inputVars = [
    textInputVariable,
    messageInputVariable,
    matchType === MatchType.String ? matchTextInputVariable : undefined
  ].filter((v): v is InputPortVariable => !!v)

  const inputVals = await resolveInputVariables(context, inputVars)

  // 取输入值
  const textInput = String(inputVals[textInputVariable.id] ?? '')
  const matchText = String(inputVals[matchTextInputVariable?.id] ?? '')
  const message = inputVals[messageInputVariable.id] ?? ''

  // -------- 判断类型 --------
  if (matchType !== MatchType.String && matchType !== MatchType.Boolean) {
    throw new Error(`[IfElse] Unsupported matchType: ${matchType}`)
  }

  // -------- 执行比较 --------
  const norm = (s: string) => (caseSensitive ? s : s.toLowerCase())

  const applyString = () => {
    const a = norm(textInput)
    const b = norm(matchText)
    switch (operator) {
      case 'equals': return a === b
      case 'contains': return a.includes(b)
      case 'startsWith': return a.startsWith(b)
      case 'endsWith': return a.endsWith(b)
      case 'matches': return new RegExp(b).test(a)
      case 'isEmpty': return a.trim() === ''
      case 'isNotEmpty': return a.trim() !== ''
      case 'isNull': return a === 'null' || a === ''
      case 'isNotNull': return a !== 'null' && a !== ''
      default: return false
    }
  }

  const applyBoolean = () => {
    const v = norm(textInput)
    return operator === 'true' ? v === 'true' : operator === 'false' && v === 'false'
  }

  const passed = matchType === MatchType.String ? applyString() : applyBoolean()

  return {
    [trueOutputVariable.id]: passed ? message : undefined,
    [falseOutputVariable.id]: passed ? undefined : message,
    default: passed, // executor 依此剪枝
  }
}
