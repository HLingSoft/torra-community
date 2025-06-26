import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { IfElseData } from '@/types/node-data/if-else'
import { MatchType } from '@/types/node-data/if-else'
import { resolveInputVariables, writeLogs } from '../utils'
import { InputPortVariable } from '~/types/workflow'

export const ifElseFactory = async (node: LangFlowNode, context: BuildContext) => {

  const t0 = performance.now()
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


  const inputVars = [
    textInputVariable,
    messageInputVariable,
    matchType === MatchType.String ? matchTextInputVariable : undefined
  ].filter((v): v is InputPortVariable => !!v)

  const inputVals = await resolveInputVariables(context, inputVars)

  const textInput = String(inputVals[textInputVariable.id] ?? '')
  const matchText = String(inputVals[matchTextInputVariable?.id] ?? '')
  const message = inputVals[messageInputVariable.id] ?? ''

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
  const elapsed = performance.now() - t0

  const result = {
    [trueOutputVariable.id]: passed ? message : undefined,
    [falseOutputVariable.id]: passed ? undefined : message,
    default: passed
  }

  // ✅ 写结构化日志
  writeLogs(context, node.id, data.title, data.type, {

    default: {
      content: {
        passthrough: message,
        passed,
        branch: passed ? 'if-true' : 'if-false'
      },

      outputPort: passed ? trueOutputVariable : falseOutputVariable,
      elapsed
    }
  }, elapsed)

  return result
}
