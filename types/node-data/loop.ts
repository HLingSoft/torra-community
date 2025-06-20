

import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'


export interface LoopData {
    type: string
    title: string
    description: string
    icon?: string

    listDataInputVariable: InputPortVariable
    loopItemResultInputVariable: InputPortVariable
    itemOutputVariable: OutputPortVariable
    doneOutputVariable: OutputPortVariable


    show?: boolean
    saved?: boolean
}

export const LoopLangchainName = 'Loop'

export const loopMeta: LoopData = {
    type: LoopLangchainName,
    title: 'Loop',
    description: `Iterates over a list of Data objects, outputting one item at a time and aggregating results from loop inputs.`,
    icon: 'qlementine-icons:loop-24',

    listDataInputVariable: {
        name: 'List Data',
        allowedTypes: ['Data[]'],
        value: '',

    } as InputPortVariable,
    loopItemResultInputVariable: {
        name: 'Loop Item Result',
        allowedTypes: ['Data'],
        value: '',

    } as InputPortVariable,
    itemOutputVariable: {
        name: 'Return Loop Item',
        outputType: 'Data',
    } as OutputPortVariable,
    doneOutputVariable: {
        name: 'When Done',
        outputType: 'Data[]',
    } as OutputPortVariable,
    show: true,
}
