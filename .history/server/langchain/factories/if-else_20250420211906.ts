import type { FlowNode, BuildContext } from '~/types/workflow'
import type { IfElseData } from '@/types/node-data/if-else'
import { RunnableLambda } from '@langchain/core/runnables'
import { resolveInputVariables } from '../resolveInput'

export async function ifElseFactory(node: FlowNode, context: BuildContext) {
  const data = node.data as IfElseData

  const {
    textInputVariable,
    matchType,
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
  const message = inputValues[messageVariable.name] ?? ''
  console.log('ifElseFactory:', textInput, matchText, message,matchType)
  if (matchType !== 'String' && matchType !== 'Boolean') {
    throw new Error(`[IfElse] Unsupported matchType: "${matchType}". Only "String" and "Boolean" are allowed.`)
  }


  function applyStringOperator(text: string, match: string) {
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
      default: return false
    }
  }

  function applyBooleanOperator(text: string): boolean {
    const normalized = text.toLowerCase().trim()
    switch (operator) {
      case 'true': return normalized === 'true'
      case 'false': return normalized === 'false'
      default: return false
    }
  }

  let result = false
  if (matchType === 'String') {
    result = applyStringOperator(textInput, matchText)
  } else if (matchType === 'Boolean') {
    result = applyBooleanOperator(textInput)
  }

  // const result = applyOperator(textInput, matchText)
  // // const result=true
  console.log('ifElseFactory:', result)

  return {
    [trueOutputVariable.id]:  result ? message : undefined,
    [falseOutputVariable.id]: !result ? message : undefined,
    default:result
  }
}
