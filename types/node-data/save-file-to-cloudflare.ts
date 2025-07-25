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

export interface SaveToFileCloudflareData {
    title: string // 节点标题
    type: string // 节点类型
    icon?: string // 节点图标
    description: string // 节点描述
    accountIdInputPortVariable: InputPortVariable
    bucketInputPortVariable: InputPortVariable
    publicUrlInputPortVariable: InputPortVariable
    tokenInputPortVariable: InputPortVariable

    inputInputVariable: InputPortVariable
    outputVariable: OutputPortVariable
    toolOutputVariable: OutputPortVariable // 可选的工具输出变量
    fileType: string,
    show: boolean // 控制 UI 展示
    saved: boolean // 是否保存
}
export const SaveToFileCloudflareLangchainName = 'SaveToFileCloudflare' // 节点类型
export const saveToFileCloudflareMeta: SaveToFileCloudflareData = {
    title: 'Save File to Cloudflare',
    description: 'Stores base64 data in Cloudflare and returns a shareable file URL.',
    type: SaveToFileCloudflareLangchainName,
    icon: 'devicon:cloudflare',
    fileType: 'PNG', // 文件类型

    accountIdInputPortVariable: {
        name: 'Account ID',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,
    bucketInputPortVariable: {
        name: 'Bucket Name',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,
    publicUrlInputPortVariable: {
        name: 'Public URL',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,
    tokenInputPortVariable: {
        name: 'Access Token',
        allowedTypes: ['Data'],
        value: '',
    } as InputPortVariable,


    inputInputVariable: {
        name: 'Base64',
        allowedTypes: ['Base64'],
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
