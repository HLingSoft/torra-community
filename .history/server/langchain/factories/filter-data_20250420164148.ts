import type { FilterDataData } from '@/types/node-data/filter-data'
import type { BuildContext, FlowNode, InputPortVariable, OutputPortVariable } from '~/types/workflow'

import {   AIMessage } from '@langchain/core/messages'
 
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function filterDataFactory(node: FlowNode, context: BuildContext) {
  const {
    filterKey,
    inputVariable,
    outputVariable,
  } = node.data as FilterDataData
 
 
  const variableDefs = [inputVariable] as InputPortVariable[]
   

  const inputValues = await resolveInputVariables(context, variableDefs)
  const inputValue = inputValues[inputVariable.name]

    const inputValueObject = JSON.parse(inputValue) as Record<string, any>
    const result= inputValueObject[filterKey]
    //能够字段判断 result 的类型吗，然后返回具体的类型，否则都是字符串了

  

 
 
  return {
     
    [outputVariable.id]: result,
  }
}


 
