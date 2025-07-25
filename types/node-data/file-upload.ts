

import type { OutputPortVariable } from '~~/types/workflow'


export interface FileUploadData {
    type: string
    title: string
    description: string
    icon?: string
    selectedFile: File | null // 选择的文件对象
    selectedFileType: string // 文件类型
    selectedFileName: string // 文件名
    selectedFileSize: number      // 字节数（纯展示用，可选）
    selectedFileBase64Data: string
    outputPortVariable: OutputPortVariable // 输出端口变量

    show?: boolean
    saved?: boolean
}

export const FileUploadLangchainName = 'FileUpload'

export const fileUploadMeta: FileUploadData = {
    type: FileUploadLangchainName,
    title: 'Upload Local File',
    description: `Uploads a local file to the server and returns the base64 data.`,
    icon: 'solar:upload-broken',
    selectedFile: null, // 初始时没有选择文件
    selectedFileType: '',
    selectedFileName: '',
    selectedFileSize: 0,
    selectedFileBase64Data: '',
    outputPortVariable: {
        name: 'When Done',
        outputType: 'Base64',
    } as OutputPortVariable,
    show: true,
}
