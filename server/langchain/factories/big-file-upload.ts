import type { BigFileUploadData } from '~~/types/node-data/big-file-upload'
import type {
    BuildContext,
    LangFlowNode,
    NodeFactory
} from '~~/types/workflow'

import { writeLogs } from '../utils'

/**
 * 工厂函数：上传本地文件，并输出 base64 字符串
 */
export const bigFileUploadFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const t0 = performance.now()
    const data = node.data as BigFileUploadData

    const fileRemoteUrl = data.fileRemoteUrl
    const outputPort = data.outputPortVariable
    const outputPortId = outputPort.id

    if (!fileRemoteUrl || fileRemoteUrl.trim() === '') {
        throw new Error(`[Big FileUpload] 未选择文件，节点 ${node.id} 无法执行`)
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
                content: fileRemoteUrl,
                outputPort,
                elapsed
            }
        },
        elapsed
    )

    return {
        [outputPortId]: fileRemoteUrl
    }
}
