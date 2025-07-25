import type { AudioDurationData } from '~~/types/node-data/audio-duration'
import type { BuildContext, LangFlowNode, InputPortVariable } from '~~/types/workflow'
import { writeLogs, resolveInputVariables } from '../utils'
import { parseStream } from 'music-metadata'
import got from 'got'

/** ID 生成器节点工厂函数 */
export async function audioDurationFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const t0 = performance.now()
    const data = node.data as AudioDurationData
    const { urlInputportVariable, outputVariable } = data
    const variableDefs: InputPortVariable[] = [urlInputportVariable]
    const inputValues = await resolveInputVariables(context, variableDefs)
    const url = inputValues[urlInputportVariable.id]
    let duration = 0

    try {
        // 获取远程音频流
        const responseStream = got.stream(url)

        // 用 music-metadata 解析音频流
        const metadata = await parseStream(responseStream, undefined, { duration: true })
        duration = metadata.format.duration || 0
    } catch (error) {
        console.error('[音频时长获取失败]', error)
        duration = 0
    }

    const elapsed = performance.now() - t0

    // ✅ 写入结构化日志
    writeLogs(context, node.id, data.title, data.type, {
        [outputVariable.id]: {
            content: `${url} 的时长：${duration.toFixed(2)} 秒`,
            outputPort: outputVariable,
            elapsed,
        }
    }, elapsed)

    // 返回给流程系统
    return {
        [outputVariable.id]: duration
    }
}
