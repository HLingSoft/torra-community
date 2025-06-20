import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable
} from '~/types/workflow'
import type { ImageRecognitionOpenAIData } from '~/types/node-data/image-recognition-openai'
import { resolveInputVariables, writeLog, wrapRunnable } from '../resolveInput'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'
import { RunnableLambda } from '@langchain/core/runnables'
import { StructuredTool } from "langchain/tools";
import { z } from "zod";

function isBase64Image(str: string): boolean {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
}
function isHttpUrl(str: string): boolean {
    return /^https?:\/\/[^\s]+$/i.test(str);
}
function normalizeImageInputs(
    imageData: string | string[],
    maxImages: number = 5
): { type: "image_url", image_url: { url: string } }[] {
    if (!imageData) return [];
    const arr = Array.isArray(imageData) ? imageData : [imageData];
    const sliced = arr.slice(0, maxImages);


    return sliced.map(img => {
        if (isHttpUrl(img)) {
            // 远程图片 URL
            return {
                type: "image_url",
                image_url: { url: img }
            };
        } else if (isBase64Image(img)) {
            // 已经带data:image前缀的 base64
            return {
                type: "image_url",
                image_url: { url: img }
            };
        } else if (/^[A-Za-z0-9+/=]+$/.test(img)) {
            // 纯 base64 字符串，无前缀
            // 默认用 png 前缀拼成 data url
            return {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${img}` }
            };
        } else {
            throw new Error(`非法图片输入: ${img}`);
        }
    });
}

export const imageRecognitionOpenAIFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {

    const {
        imageDataInputVariable,
        outputVariable,
        instructionInputVariable,
        apiKeyInputVariable,
        baseURLInputVariable,
        toolOutputVariable,

    } = node.data as ImageRecognitionOpenAIData;

    const variableDefs = [imageDataInputVariable, instructionInputVariable, apiKeyInputVariable, baseURLInputVariable] as InputPortVariable[];

    const inputValues = await resolveInputVariables(context, variableDefs);
    const imageData = inputValues[imageDataInputVariable.id];
    const instruction = inputValues[instructionInputVariable.id];

    const chat = new ChatOpenAI({
        model: "gpt-4-vision-preview",
        openAIApiKey: inputValues[apiKeyInputVariable.id],
        configuration: {
            baseURL: inputValues[baseURLInputVariable.id] || 'https://api.openai.com/v1',
        }
    });

    // 1. 规范化图片输入，并限制最大图片数量
    const imageContents = normalizeImageInputs(imageData, 5); // 最多5张

    // 2. 构建 message 内容（文字指令+所有图片）
    const message = new HumanMessage({
        content: [
            { type: "text", text: instruction || "请描述这张图片：" },
            ...imageContents
        ]
    });

    // 3. 组装 RunnableLambda
    // const res = await chat.call([message]);
    const imageRecognitionChain = RunnableLambda.from(async (input, options) => {
        // 你也可以将 input 作为 prompt 或图片
        const res = await chat.call([message])
        return res.content
    })
    // console.log(res.content);



    // 4. 返回结果
    const wrapped = wrapRunnable(
        imageRecognitionChain,
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: outputVariable.id,
            logFormat: res => ({
                type: "openai image recognition",
                data: res
            })
        }
    )


    //5. 创建工具实例
    const tool = new ImageRecognitionTool(
        node.id, // <--- 直接传 node.id 作为第一个参数
        imageData, // 传入图片数据
        {
            apiKey: inputValues[apiKeyInputVariable.id],
            baseURL: inputValues[baseURLInputVariable.id] || 'https://api.openai.com/v1',
        },


    );
    return {
        [outputVariable.id]: wrapped,
        [toolOutputVariable.id]: tool
    };
}


class ImageRecognitionTool extends StructuredTool {
    name: string;
    description: string;
    schema: z.ZodObject<any>; // 必须加 schema


    constructor(
        private id: string,
        private imageData: string | string[],
        private modelParams: { apiKey: string; baseURL: string },
    ) {
        super();
        this.name = `image-recognition-${id}`;
        this.description = "使用 OpenAI 视觉模型识别图片内容。参数：imageData（图片url或base64），instruction（可选）";
        this.schema = z.object({
            imageData: z.string().optional().describe("图片url或base64"),
            instruction: z.string().describe("识别指令"),
        });
    }

    async _call(inputs: { imageData: string | string[]; instruction?: string }) {
        const chat = new ChatOpenAI({
            model: "gpt-4-vision-preview",
            openAIApiKey: this.modelParams.apiKey,
            configuration: { baseURL: this.modelParams.baseURL },
        });
        //如果 imageData 有连接线或者有值，则优先使用this.imageData。否则将使用 agent 的输入
        const imageContents = normalizeImageInputs(this.imageData ?? inputs.imageData, 5);

        const message = new HumanMessage({
            content: [
                { type: "text", text: inputs.instruction || "请描述这张图片：" },
                ...imageContents,
            ]
        });

        const res = await chat.call([message]);

        return res.content;
    }
}
