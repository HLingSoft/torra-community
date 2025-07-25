import type { InputPortVariable, OutputPortVariable } from '~~/types/workflow'

// 文件类型 => 扩展名 & mimeType 映射（可按需扩展）
export const EXT_MIME_MAP: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    wav: 'audio/wav',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    pcm: 'audio/pcm',


};

export interface SaveToFileLCData {
    title: string // 节点标题
    type: string // 节点类型
    icon?: string // 节点图标
    description: string // 节点描述
    inputInputVariable: InputPortVariable
    outputVariable: OutputPortVariable
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    fileType: string,
    show: boolean // 控制 UI 展示
    saved: boolean // 是否保存
}
export const SaveToFileLCLangchainName = 'SaveToFileLC' // 节点类型
export const saveToFileLCMeta: SaveToFileLCData = {
    title: 'Save File to LocalHost',
    description: 'Stores base64 data or a file URL in LocalHost and returns a shareable file URL.',
    type: SaveToFileLCLangchainName,
    icon: 'solar:file-line-duotone',
    fileType: 'PNG', // 文件类型
    inputInputVariable: {
        name: 'Base64 OR File URL',
        allowedTypes: ['Base64', 'Data'],
        value: '',
    } as InputPortVariable,
    outputVariable: {
        name: 'Return File URL',
        outputType: 'Data',
    } as OutputPortVariable,
    toolOutputVariable: {
        name: 'As Tool',
        outputType: 'Tool',
    } as OutputPortVariable,
    show: true,
    saved: false,
}
