import type { ReplicateKlingVideoData } from '~~/types/node-data/video-replicate-kling'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~~/types/workflow'
import Replicate from "replicate";
import { resolveInputVariables, writeLogs, financeConsume, financeBalance, fetchToBase64, streamToBase64 } from '../utils'


/**
 * ReplicateKlingVideo – 更健壮的 Kling Video 节点
 *
 * ​改动要点：
 * 1. 统一以 URL 形式获取结果，再主动下载转为 base64；
 * 2. 针对 string | {url} | string[] | ReadableStream 等多种输出类型做兼容处理；
 * 3. useFileOutput 固定为 false，避免偶发的流失效问题。
 */

export const replicateKlingVideoFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext,
) => {
    await financeBalance(context)
    const t0 = performance.now()
    const data = node.data as ReplicateKlingVideoData
    const {
        mode,
        duration,
        aspectRatio,
        authInputVariable,
        promptInputport,
        startImageInputport,
        negativePromptInputport,
        base64VideoOutputVariable,
    } = data

    // 解析输入
    const inputValues = await resolveInputVariables(context, [
        authInputVariable,
        promptInputport,
        startImageInputport,
        negativePromptInputport,
    ])
    const auth = inputValues[authInputVariable.id] as string
    const prompt = inputValues[promptInputport.id] as string
    const startImage = inputValues[startImageInputport.id] as string
    const negativePrompt = inputValues[negativePromptInputport.id] as string

    const replicate = new Replicate({ auth, useFileOutput: false })

    const input =
        mode === 'standard'
            ? {
                mode: 'pro',
                prompt,
                start_image: startImage,
                negative_prompt: negativePrompt,
                duration,
                aspect_ratio: aspectRatio,
            }
            : { prompt, negative_prompt: negativePrompt, duration, aspect_ratio: aspectRatio }

    const klingModel = mode === 'standard' ? 'kwaivgi/kling-v2.1' : 'kwaivgi/kling-v2.1-master'

    let base64: string | undefined
    try {
        const output = (await replicate.run(klingModel, {
            input,
            wait: { mode: 'poll', interval: 1000 },
        })) as unknown

        let videoUrl: string | undefined
        if (typeof output === 'string') videoUrl = output
        else if (Array.isArray(output) && typeof output[0] === 'string') videoUrl = output[0]
        else if (output && typeof (output as any).url === 'string') videoUrl = (output as any).url
        else if (output && typeof (output as any).url === 'function')
            videoUrl = (output as any).url().toString()

        if (!videoUrl) throw new Error('模型未返回有效的视频 URL')

        base64 = await fetchToBase64(videoUrl)

        await financeConsume(
            context,
            `通过 Replicate Kling Video 生成视频。模型: ${klingModel}, 模式: ${mode}, 持续时间: ${duration}秒`,
            mode === 'standard' ? Number((duration * 0.09).toFixed(2)) : Number((duration * 3).toFixed(2)),
        )

        const elapsed = performance.now() - t0
        writeLogs(
            context,
            node.id,
            data.title,
            data.type,
            {
                [base64VideoOutputVariable.id]: {
                    content: { base64: base64.slice(0, 50) + '...(内容过长已截断)' },
                    outputPort: base64VideoOutputVariable,
                    elapsed,
                },
            },
            elapsed,
        )

        return { [base64VideoOutputVariable.id]: base64 }
    } catch (error) {
        console.error('Error running Replicate Kling Video:', error)
        throw new Error(`Failed to run Replicate Kling Video: ${error}`)
    }
}
