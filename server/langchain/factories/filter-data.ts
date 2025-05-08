import type { FilterDataData } from '@/types/node-data/filter-data'
import type { BuildContext, FlowNode, InputPortVariable, OutputPortVariable } from '~/types/workflow'


import { resolveInputVariables, writeLog } from '../../langchain/resolveInput'

export async function filterDataFactory(node: FlowNode, context: BuildContext) {
    const {
        filterKey,
        inputVariable,
        outputVariable,
    } = node.data as FilterDataData


    const variableDefs = [inputVariable, filterKey] as InputPortVariable[]
    // console.log('filterDataFactory variableDefs:', variableDefs)

    const inputValues = await resolveInputVariables(context, variableDefs)
    const inputValue = inputValues[inputVariable.name]
    const filterKeyValue = inputValues[filterKey.name]
    // console.log('filterDataFactory inputValues:', inputValues)

    const inputValueObject = JSON.parse(inputValue) as Record<string, any>
    const result = inputValueObject[filterKeyValue]
    //能够字段判断 result 的类型吗，然后返回具体的类型，否则都是字符串了
    // console.log('filterDataFactory result:', result)

    writeLog(
        context,
        node.id,
        outputVariable.id,
        result,

    )



    return {

        [outputVariable.id]: result,

    }
}



