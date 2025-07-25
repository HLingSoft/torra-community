import type { SpeechGenerateMinimaxData } from '~~/types/node-data/speech-generate-replicate-minimax'
import type { BuildContext, LangFlowNode, NodeFactory } from '~~/types/workflow'
import Replicate from 'replicate'
import { resolveInputVariables, writeLogs, fetchToBase64, streamToBase64 } from '../utils'



/**
 * replicateMinimaxFactory – 更健壮的 Replicate Minimax TTS 节点
 *
 * ​改动要点：
 * 1. useFileOutput 设置为 false，优先返回 URL，提高稳定性；
 * 2. 同时兼容 URL / ReadableStream / string[] / {url} 多种输出格式；
 * 3. 统一下载后转为 base64，后续流程保持不变。
 */
export const replicateMinimaxFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext,
) => {
    const t0 = performance.now()

    const data = node.data as SpeechGenerateMinimaxData
    const {
        authInputVariable,
        userInputInputVariable,
        voiceId,
        speed,
        volume,
        emotion,
        base64VoiceOutputVariable,
    } = data

    const inputValues = await resolveInputVariables(context, [authInputVariable, userInputInputVariable])
    const auth = inputValues[authInputVariable.id] as string
    const text = inputValues[userInputInputVariable.id] as string

    const replicate = new Replicate({ auth, useFileOutput: false })

    const input: Record<string, any> = {
        text,
        pitch: 0,
        speed: speed ?? 1,
        volume: volume ?? 1,
        bitrate: 128000,
        channel: 'mono',
        emotion: emotion ?? 'neutral',
        voice_id: voiceId ?? 'Friendly_Person',
        sample_rate: 32000,
        english_normalization: false,
    }

    let base64: string | undefined
    try {
        const output = (await replicate.run('minimax/speech-02-hd', { input })) as unknown
        if (typeof output === 'string') base64 = await fetchToBase64(output)
        else if (Array.isArray(output) && typeof output[0] === 'string')
            base64 = await fetchToBase64(output[0])
        else if (output instanceof ReadableStream) base64 = await streamToBase64(output)
        else if (output && typeof (output as any).url === 'string')
            base64 = await fetchToBase64((output as any).url)
        else if (output && typeof (output as any).url === 'function')
            base64 = await fetchToBase64((output as any).url().toString())
        else throw new Error('未知的 Minimax TTS 返回类型')
    } catch (error) {
        console.error('Error running Replicate Minimax TTS:', error)
        throw new Error(`Failed to run Replicate Minimax TTS: ${error}`)
    }

    const elapsed = performance.now() - t0
    writeLogs(
        context,
        node.id,
        data.title,
        data.type,
        {
            [base64VoiceOutputVariable.id]: {
                content: { base64: base64?.slice(0, 50) + '...(内容过长已截断)' },
                outputPort: base64VoiceOutputVariable,
                elapsed,
            },
        },
        elapsed,
    )

    return { [base64VoiceOutputVariable.id]: base64 }
}
