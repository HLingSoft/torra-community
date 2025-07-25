import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable,
    OutputPortVariable
} from '~~/types/workflow'
import type { ImageGenerateOpenAIDALLE3Data } from '~~/types/node-data/image-generate-openai-dalle3'
import { resolveInputVariables, writeLogs, updatePortLog } from '../utils'


import { StructuredTool } from "langchain/tools";
import { DallEAPIWrapper } from "@langchain/openai";
import { z } from "zod";


export const imageGenerateOpenAIFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const t0 = performance.now();
    const {
        userInputInputVariable,
        apiKeyInputVariable,
        baseURLInputVariable,
        toolOutputVariable,
        base64ImageOutputVariable,

        style,
        quality,
        size

    } = node.data as ImageGenerateOpenAIDALLE3Data;

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

    const prompt = inputValues[userInputInputVariable.id];
    const result = await tool.invoke(prompt);


    const customTool = new DallEImageGenerateTool({
        apiKey: inputValues[apiKeyInputVariable.id],
        baseUrl: inputValues[baseURLInputVariable.id],
        size,
        style,
        quality,
    }, context,
        node.id,
        toolOutputVariable.id,
    );

    const elapsed = performance.now() - t0;
    // ✅ 写入结构化日志
    writeLogs(context, node.id, node.data.title, node.data.type, {
        [base64ImageOutputVariable.id]: {
            content: 'DALL·E 3 Base64 Image Output',
            outputPort: base64ImageOutputVariable,
            elapsed
        },
        [toolOutputVariable.id]: {
            content: 'DALL·E Image Generation Tool',
            outputPort: toolOutputVariable,
            elapsed
        }
    }, elapsed);


    return {
        [base64ImageOutputVariable.id]: result,
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
    }, private context: BuildContext,
        private nodeId: string,

        private portId: string) {
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
        const elapsed = performance.now() - t0
        updatePortLog(this.context, this.nodeId, this.portId, {
            content: result,
            elapsed
        })

        return result
    }
}
