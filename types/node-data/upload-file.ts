

import type { OutputPortVariable } from '~~/types/workflow'


export interface UploadFileData {
    type: string
    title: string
    description: string
    icon?: string

    outputPortVariable: OutputPortVariable // 输出端口变量

    show?: boolean
    saved?: boolean
}

export const UploadFileLangchainName = 'UploadFile'

export const uploadFileMeta: UploadFileData = {
    type: UploadFileLangchainName,
    title: 'Upload Local File',
    description: `Uploads a local file to the server and returns the base64 data.`,
    icon: 'solar:upload-broken',

    outputPortVariable: {
        name: 'When Done',
        outputType: 'Base64',
    } as OutputPortVariable,
    show: true,
}
