import type { FileUploadData } from '~~/types/node-data/file-upload'
import type {
    BuildContext,
    LangFlowNode,
    NodeFactory
} from '~~/types/workflow'

import { writeLogs } from '../utils'

/**
 * 工厂函数：上传本地文件，并输出 base64 字符串
 */
export const fileUploadFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const t0 = performance.now()
    const data = node.data as FileUploadData

    const selectedFileBase64Data = data.selectedFileBase64Data
    const outputPort = data.outputPortVariable
    const outputPortId = outputPort.id

    if (!selectedFileBase64Data || selectedFileBase64Data.trim() === '') {
        throw new Error(`[FileUpload] 未选择文件，节点 ${node.id} 无法执行`)
    }



    const elapsed = performance.now() - t0

    // ✅ 结构化日志记录
    writeLogs(
        context,
        node.id,
        data.title,
        data.type,
        {
            [outputPortId]: {
                content: selectedFileBase64Data.slice(0, 100) + '...', // 截断前100个字符
                outputPort,
                elapsed
            }
        },
        elapsed
    )

    return {
        [outputPortId]: selectedFileBase64Data
    }
}
