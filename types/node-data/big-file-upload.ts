

import type { OutputPortVariable } from '~~/types/workflow'


export interface BigFileUploadData {
    type: string
    title: string
    description: string
    icon?: string
    selectedFile: File | null // 选择的文件对象
    selectedFileType: string // 文件类型
    selectedFileName: string // 文件名
    selectedFileSize: number      // 字节数（纯展示用，可选）
    fileRemoteUrl: string // 远程文件 URL
    outputPortVariable: OutputPortVariable // 输出端口变量

    show?: boolean
    saved?: boolean
}

export const BigFileUploadLangchainName = 'BigFileUpload'

export const bigFileUploadMeta: BigFileUploadData = {
    type: BigFileUploadLangchainName,
    title: 'Upload Local File(Max 200MB)',
    description: `Uploads a local file to the server and returns the leancloud file url.`,
    icon: 'solar:upload-broken',
    selectedFile: null, // 初始时没有选择文件
    selectedFileType: '',
    selectedFileName: '',
    selectedFileSize: 0,
    fileRemoteUrl: '',
    outputPortVariable: {
        name: 'When Done',
        outputType: 'Data',
    } as OutputPortVariable,
    show: true,
}
