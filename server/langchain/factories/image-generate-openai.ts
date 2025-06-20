import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable
} from '~/types/workflow'
import type { ImageGenerateOpenAIData } from '~/types/node-data/image-generate-openai'
import { resolveInputVariables, writeLog, wrapRunnable } from '../resolveInput'
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

    // 用 wrapRunnable 包装，支持 pipeline 自动调用、日志
    const wrappedBase64 = wrapRunnable(
        imageGenerateChain,
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: base64ImageOutputVariable.id,
            logFormat: res => ({
                type: "openai-image-base64",
                data: res
            })
        }
    );


    const customTool = new DallEImageGenerateTool({
        apiKey: inputValues[apiKeyInputVariable.id],
        baseUrl: inputValues[baseURLInputVariable.id],
        size,
        style,
        quality,
    });
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
    }) {
        super();
    }

    async _call(inputs: { prompt: string }) {
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

        return result
    }
}
