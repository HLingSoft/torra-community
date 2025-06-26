import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable,
    OutputPortVariable
} from '~/types/workflow'
import type { ImageGenerateOpenAIData } from '~/types/node-data/image-generate-openai'
import { resolveInputVariables, writeLogs, wrapRunnable } from '../utils'
import { RunnableLambda } from "@langchain/core/runnables";

import { StructuredTool } from "langchain/tools";
import { DallEAPIWrapper } from "@langchain/openai";
import { z } from "zod";


export const imageGenerateOpenAIFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    // console.log('imageGenerateOpenAIFactory', node.id, context);
    const {
        userInputInputVariable,
        apiKeyInputVariable,
        baseURLInputVariable,
        toolOutputVariable,
        base64ImageOutputVariable,
        // urlOutputVariable,
        style,
        quality,
        size

    } = node.data as ImageGenerateOpenAIData;

    const variableDefs = [userInputInputVariable, apiKeyInputVariable, baseURLInputVariable] as InputPortVariable[];
    const inputValues = await resolveInputVariables(context, variableDefs);



    const tool = new DallEAPIWrapper({
        n: 1,
        model: "dall-e-3",
        apiKey: inputValues[apiKeyInputVariable.id],
        baseUrl: inputValues[baseURLInputVariable.id],
        style,
        quality,
        size,
        dallEResponseFormat: 'b64_json'


    });
    // 用 RunnableLambda 封装图片生成
    const imageGenerateChain = RunnableLambda.from(async (input) => {
        // 支持 pipeline 传递 prompt
        const prompt = inputValues[userInputInputVariable.id];
        return await tool.invoke(prompt);
    });

    const wrappedBase64 = wrapRunnable(
        imageGenerateChain,
        node.id,
        node.data.title,
        node.data.type,
        context.onRunnableElapsed,
        {
            context,
            portId: base64ImageOutputVariable.id,
            logFormat: res => ({
                type: "openai-image-base64",
                data: res
            }),
            outputPort: base64ImageOutputVariable // ✅ 关键：结构化日志需要包含 outputPort
        }
    )

    const customTool = new DallEImageGenerateTool({
        apiKey: inputValues[apiKeyInputVariable.id],
        baseUrl: inputValues[baseURLInputVariable.id],
        size,
        style,
        quality,
    }, context,
        node.id,
        node.data.title,
        node.data.type,
        toolOutputVariable.id,
        toolOutputVariable);
    return {
        [base64ImageOutputVariable.id]: wrappedBase64,
        [toolOutputVariable.id]: customTool
    };
}



class DallEImageGenerateTool extends StructuredTool {
    name = "image-generate";
    description = "使用 OpenAI DALL·E 生成图片，参数：prompt（描述文本）";
    schema = z.object({
        prompt: z.string().describe("图片描述文本")
    });

    constructor(private modelParams: {
        apiKey: string; baseUrl: string; size: "1024x1024" | "1792x1024" | "1024x1792"; style: "natural" | "vivid"; quality: "standard" | "hd"
    }, private context?: BuildContext,
        private nodeId?: string,
        private title?: string,
        private type?: string,
        private portId?: string,
        private outputPort?: OutputPortVariable) {
        super();
    }

    async _call(inputs: { prompt: string }) {
        const t0 = performance.now()
        const wrapper = new DallEAPIWrapper({
            n: 1,
            model: "dall-e-3",
            apiKey: this.modelParams.apiKey,
            baseUrl: this.modelParams.baseUrl,
            size: this.modelParams.size,
            style: this.modelParams.style,
            quality: this.modelParams.quality,
            dallEResponseFormat: 'url',
        });
        const result = await wrapper.invoke(inputs.prompt);
        // console.log('DALL·E Image Generation Result:', result);

        const elapsed = performance.now() - t0


        if (this.context && this.nodeId && this.portId && this.outputPort) {
            writeLogs(
                this.context,
                this.nodeId,
                this.title || 'DALL·E Image Generation',
                this.type || 'image-generate-openai',
                {
                    [this.portId]: {
                        content: result,
                        outputPort: this.outputPort,
                        elapsed
                    }
                },
                elapsed,

            )
        }

        return result
    }
}
