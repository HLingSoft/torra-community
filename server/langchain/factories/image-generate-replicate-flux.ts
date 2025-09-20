import type { ReplicateFluxData } from '~~/types/node-data/image-generate-replicate-flux'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~~/types/workflow'
import Replicate from "replicate";
import { resolveInputVariables, writeLogs, financeConsume, financeBalance, fetchToBase64, streamToBase64 } from '../utils'

/**
 * ReplicateFlux 节点工厂函数
 */


export const replicateFluxFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext,
) => {
    await financeBalance(context)
    const t0 = performance.now()

    const data = node.data as ReplicateFluxData
    const {
        aspectRatio,
        imagePromptInputPortVariable,
        authInputVariable,
        promptInputport,
        base64ImageOutputVariable,
    } = data

    const inputValues = await resolveInputVariables(context, [
        authInputVariable,
        promptInputport,
        imagePromptInputPortVariable,
    ])
    const auth = inputValues[authInputVariable.id] as string
    const prompt = inputValues[promptInputport.id] as string
    const imagePrompt = inputValues[imagePromptInputPortVariable.id] as string | undefined

    const replicate = new Replicate({ auth, useFileOutput: false })

    const input: Record<string, any> = {
        raw: true,
        aspect_ratio: aspectRatio || '1:1',
        prompt_upsampling: true,
        prompt,
        safety_tolerance: 5,
        image_prompt_strength: 0,
    }
    if (imagePrompt) input.image_prompt = imagePrompt

    let base64: string | undefined
    try {
        const output = (await replicate.run('black-forest-labs/flux-1.1-pro', { input })) as unknown

        if (typeof output === 'string') {
            base64 = await fetchToBase64(output)
        } else if (Array.isArray(output) && typeof output[0] === 'string') {
            base64 = await fetchToBase64(output[0])
        } else if (output instanceof ReadableStream) {
            base64 = await streamToBase64(output)
        } else if (output && typeof (output as any).url === 'string') {
            base64 = await fetchToBase64((output as any).url)
        } else if (output && typeof (output as any).url === 'function') {
            base64 = await fetchToBase64((output as any).url().toString())
        } else {
            throw new Error('未知的 Flux 返回类型')
        }

        await financeConsume(
            context,
            `通过 Replicate Flux 生成图片。模型: flux-1.1-pro, 比例: ${input.aspect_ratio}, 提示: ${prompt}`,
            0.3,
        )
    } catch (error) {
        console.error('Error running Replicate Flux:', error)
        throw new Error(`Failed to run Replicate Flux: ${error}`)
    }

    const elapsed = performance.now() - t0
    writeLogs(
        context,
        node.id,
        data.title,
        data.type,
        {
            [base64ImageOutputVariable.id]: {
                content: { base64: base64?.slice(0, 50) + '...(内容过长已截断)' },
                outputPort: base64ImageOutputVariable,
                elapsed,
            },
        },
        elapsed,
    )

    return { [base64ImageOutputVariable.id]: base64 }
}


