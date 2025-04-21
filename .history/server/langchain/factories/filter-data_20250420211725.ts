import type { FilterDataData } from '@/types/node-data/filter-data'
import type { BuildContext, FlowNode, InputPortVariable, OutputPortVariable } from '~/types/workflow'

 
import { resolveInputVariables } from '../../langchain/resolveInput'

export async function filterDataFactory(node: FlowNode, context: BuildContext) {
    const {
        filterKey,
        inputVariable,
        outputVariable,
    } = node.data as FilterDataData


    const variableDefs = [inputVariable, filterKey] as InputPortVariable[]


    const inputValues = await resolveInputVariables(context, variableDefs)
    const inputValue = inputValues[inputVariable.name]
    const filterKeyValue = inputValues[filterKey.name]

    const inputValueObject = JSON.parse(inputValue) as Record<string, any>
    const result = inputValueObject[filterKeyValue]
    //能够字段判断 result 的类型吗，然后返回具体的类型，否则都是字符串了
    console.log('filterDataFactory result:', result)





    return {

        [outputVariable.id]: result,
    }
}



