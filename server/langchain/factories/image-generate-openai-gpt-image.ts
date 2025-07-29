import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable,
    OutputPortVariable
} from '~~/types/workflow'

import type { ImageGenerateOpenAIGptImageData } from '~~/types/node-data/image-generate-openai-gpt-image'
import { resolveInputVariables, writeLogs } from '../utils'

import type { ImagesResponse } from "openai/resources/images"
import { OpenAIClient } from "@langchain/openai";  // LangChain.js OpenAIClient

export const imageGenerateOpenAIGPTImageFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    try {


        const t0 = performance.now();
        const {
            promptInputVariable,
            apiKeyInputVariable,
            baseURLInputVariable,

            count,
            compression,
            background,
            moderation,
            format,
            quality,
            size,


            base64ImageOutputVariable,
            singlebase64ImageOutputVariable

        } = node.data as ImageGenerateOpenAIGptImageData;



        const inputs = await resolveInputVariables(context, [
            promptInputVariable,
            apiKeyInputVariable,
            baseURLInputVariable,

        ]);



        // 实例化 OpenAIClient
        const client = new OpenAIClient({
            apiKey: inputs[apiKeyInputVariable.id],
            baseURL: inputs[baseURLInputVariable.id],
        });


        const resp: ImagesResponse = await client.images.generate({
            model: "gpt-image-1",
            prompt: inputs[promptInputVariable.id],
            n: count || 1,  // 默认生成一张图片
            background,
            moderation,
            output_compression: compression || 0, // 默认压缩级别
            output_format: format,
            quality,
            size
        });
        // console.log(`🔍 GPT-Image-1 node ${node.id} response:`, resp);
        // Unwrap the array of Image objects → return string[] of b64_json
        const images = resp.data?.map(img => {
            if (!img.b64_json) throw new Error("GPT-Image-1 returned an image without b64_json");
            return img.b64_json;
        }) || [];




        const elapsed = performance.now() - t0;
        writeLogs(context, node.id, node.data.title, node.data.type, {
            [base64ImageOutputVariable.id]: {
                content: 'GPT-Image-1 Base64 Array Output (multiple images)',
                outputPort: base64ImageOutputVariable,
                elapsed
            }

        }, elapsed);

        writeLogs(context, node.id, node.data.title, node.data.type, {
            [singlebase64ImageOutputVariable.id]: {
                content: 'GPT-Image-1 Base64  Output (single image)',
                outputPort: base64ImageOutputVariable,
                elapsed
            }

        }, elapsed);
        // console.log(`🔍 GPT-Image-1 node ${node.id} generated ${images.length} images in ${elapsed.toFixed(2)} ms`);
        return {
            [base64ImageOutputVariable.id]: images,
            // 如果只生成一张图片，单独输出一个 base64 字符串
            [singlebase64ImageOutputVariable.id]: images[0]


        };
    } catch (error: any) {
        console.error('Error generating images with GPT-Image-1:', error);
        throw new Error(`GPT-Image-1 generation failed: ${error.message}`);
    }
}

