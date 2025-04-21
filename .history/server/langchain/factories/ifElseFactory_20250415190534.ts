import type { FlowNode, BuildContext } from '~/types/workflow'
import type { IfElseData } from '@/types/node-data/if-else'
import { RunnableLambda } from '@langchain/core/runnables'
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function ifElseFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as IfElseData

  const {
    textInputVariable,
    matchTextVariable,
    messageVariable,
    operator,
    caseSensitive,
    trueOutputVariable,
    falseOutputVariable,
  } = data

  const variableDefs = [textInputVariable, matchTextVariable, messageVariable]
  const inputValues = await resolveInputVariables(context, variableDefs)

  const textInput = inputValues[textInputVariable.name] ?? ''
  const matchText = inputValues[matchTextVariable.name] ?? ''

  function applyOperator(text: string, match: string) {
    const t = caseSensitive ? text : text.toLowerCase()
    const m = caseSensitive ? match : match.toLowerCase()
  
    switch (operator) {
      case 'equals': return t === m
      case 'contains': return t.includes(m)
      case 'startsWith': return t.startsWith(m)
      case 'endsWith': return t.endsWith(m)
      case 'matches': return new RegExp(m).test(t)
      case 'isEmpty': return t.trim() === ''
      case 'isNotEmpty': return t.trim() !== ''
      case 'isNull': return t === 'null' || t === ''
      case 'isNotNull': return t !== 'null' && t !== ''
      case 'isTrue': return t === 'true'
      case 'isFalse': return t === 'false'
      default: return false
    }
  }

  const runnable = RunnableLambda.from(async () => {
    const result = applyOperator(textInput, matchText)
    return result
  })

  return {
    [trueOutputVariable.id]: runnable.pipe(RunnableLambda.from((v) => v === true ? true : undefined)),
    [falseOutputVariable.id]: runnable.pipe(RunnableLambda.from((v) => v === false ? false : undefined)),
  }
}
