import type { OutputPortVariable, InputPortVariable } from '~~/types/workflow'

export interface AudioDurationData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述
    urlInputportVariable: InputPortVariable // 用户输入的值
    outputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const AudioDurationDataLangchainName = 'AudioDuration' // 节点类型

export const audioDurationMeta: AudioDurationData = {
    icon: 'ic:twotone-audiotrack',
    title: 'Audio Duration',
    description: 'Calculates the duration of an audio file.',
    type: AudioDurationDataLangchainName,
    urlInputportVariable: {

        value: '',
        name: 'Audio URL',
        connected: false,
        allowedTypes: ['Data'],

    } as InputPortVariable,

    outputVariable: {
        outputType: 'Data',
        name: 'When Done',
    } as OutputPortVariable,
    show: true,
}
