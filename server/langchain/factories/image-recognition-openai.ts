import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable,
    OutputPortVariable
} from '~~/types/workflow'
import type { ImageRecognitionOpenAIData } from '~~/types/node-data/image-recognition-openai'
import { resolveInputVariables, writeLogs, updatePortLog } from '../utils'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'

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

    const t0 = performance.now();
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
        apiKey: inputValues[apiKeyInputVariable.id],
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

    const res = await chat.call([message])
    const result = res.content



    // 4. 返回结果



    //5. 创建工具实例

    const tool = new ImageRecognitionTool({
        context,
        nodeId: node.id,
        portId: outputVariable.id,

        apiKey: inputValues[apiKeyInputVariable.id],
        baseURL: inputValues[baseURLInputVariable.id],
        imageData: imageData,

    });
    const elapsed = performance.now() - t0;
    // ✅ 写入结构化日志
    writeLogs(context, node.id, node.data.title, node.data.type, {
        [outputVariable.id]: {
            content: result,
            outputPort: outputVariable,
            elapsed
        },
        [toolOutputVariable.id]: {
            content: 'OpenAI Image Recognition Tool',
            outputPort: toolOutputVariable,
            elapsed
        }
    }, elapsed);



    return {
        [outputVariable.id]: result,
        [toolOutputVariable.id]: tool
    };
}

class ImageRecognitionTool extends StructuredTool {
    name: string;
    description: string;
    schema: z.ZodObject<any>;

    private context: BuildContext;
    private nodeId: string;
    private portId: string;

    private apiKey: string;
    private baseURL: string;
    private imageData?: string | string[];

    constructor(config: {
        context: BuildContext;
        nodeId: string;
        portId: string;
        apiKey: string;
        baseURL: string;
        imageData: string | string[];

    }) {
        super();
        this.name = `image-recognition-${config.nodeId}`;
        this.description =
            "使用 OpenAI 视觉模型识别图片内容。参数：imageData（图片url或base64），instruction（可选）";
        this.schema = z.object({
            imageData: z.string().describe("图片url或base64"),
            instruction: z.string().describe("识别指令"),
        });

        this.context = config.context;
        this.nodeId = config.nodeId;
        this.portId = config.portId;

        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL;
        this.imageData = config.imageData;

    }

    async _call(inputs: { imageData?: string | string[]; instruction?: string }) {
        const chat = new ChatOpenAI({
            model: "gpt-4-vision-preview",
            apiKey: this.apiKey,
            configuration: { baseURL: this.baseURL },
        });

        const t0 = performance.now();

        const imageContents = normalizeImageInputs(
            this.imageData ?? inputs.imageData ?? [],
            5
        );

        const message = new HumanMessage({
            content: [
                { type: "text", text: inputs.instruction || "请描述这张图片：" },
                ...imageContents,
            ],
        });

        const res = await chat.call([message]);
        const result = res.content;
        const elapsed = performance.now() - t0;
        updatePortLog(this.context, this.nodeId, this.portId, {
            content: result,
            elapsed
        })


        return result;
    }
}
