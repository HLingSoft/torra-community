import type { OutputPortVariable, InputPortVariable } from '~~/types/workflow'

export interface VideoDurationData {
    type: string // 节点类型
    title: string // 节点标题
    icon?: string // 节点图标
    description: string // 节点描述
    urlInputportVariable: InputPortVariable // 用户输入的值
    outputVariable: OutputPortVariable
    show?: boolean // 控制 UI 展示
    saved?: boolean // 是否保存
}

export const VideoDurationDataLangchainName = 'VideoDuration' // 节点类型

export const videoDurationMeta: VideoDurationData = {
    icon: 'fluent:video-24-regular',
    title: 'Video Duration ( MP4/MOV )',
    description: 'Calculates the duration of an video file.',
    type: VideoDurationDataLangchainName,
    urlInputportVariable: {
        value: '',
        name: 'Video URL',
        connected: false,
        allowedTypes: ['Data'],

    } as InputPortVariable,
    outputVariable: {
        outputType: 'Data',
        name: 'When Done',
    } as OutputPortVariable,
    show: true,
}
