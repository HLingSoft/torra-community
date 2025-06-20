import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable
} from '~/types/workflow'
import type { SpeechGenerateOpenAIData } from '~/types/node-data/speech-generate-openai'
import { resolveInputVariables, writeLog, wrapRunnable } from '../resolveInput'
import { RunnableLambda } from "@langchain/core/runnables";
import { OpenAIClient } from "@langchain/openai";
import { StructuredTool } from "langchain/tools";

import { z } from "zod";


export const speechGenerateOpenAIFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const {
        userInputInputVariable,
        apiKeyInputVariable,
        baseURLInputVariable,
        toolOutputVariable,
        base64VoiceOutputVariable,
        instructionInputVariable, // 可选的指令输入变量
        modelName,

        voice, // 音色
    } = node.data as SpeechGenerateOpenAIData;

    const variableDefs = [userInputInputVariable, apiKeyInputVariable, baseURLInputVariable] as InputPortVariable[];
    const inputValues = await resolveInputVariables(context, variableDefs);
    const apiKey = inputValues[apiKeyInputVariable.id];

    const baseURL = inputValues[baseURLInputVariable.id];
    const openai = new OpenAIClient({
        apiKey,
        baseURL,
    });

    // console.log('modelName', modelName)

    const response = await openai.audio.speech.create({
        model: modelName,
        voice,
        input: inputValues[userInputInputVariable.id],
        instructions: inputValues[instructionInputVariable.id] || "", // 可选的指令
        response_format: "wav",

    });


    const voiceGenerateChain = RunnableLambda.from(async () => {
        // 支持 pipeline 传递 prompt
        const buffer = Buffer.from(await response.arrayBuffer());
        return buffer.toString("base64");
    });



    // 用 wrapRunnable 包装，支持 pipeline 自动调用、日志
    const wrappedBase64 = wrapRunnable(
        voiceGenerateChain,
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: base64VoiceOutputVariable.id,
            logFormat: res => ({
                type: "openai-voice-base64",
                data: res
            })
        }
    );


    const customTool = new OpenAIVoiceGenerateTool(
        inputValues[apiKeyInputVariable.id],
        inputValues[baseURLInputVariable.id],
        inputValues[userInputInputVariable.id],
        modelName, // 可选的模型名称
        voice // 默认音色
    );

    return {
        [base64VoiceOutputVariable.id]: wrappedBase64,

        [toolOutputVariable.id]: customTool
    };
}


// Agent Tool：OpenAI 语音合成
class OpenAIVoiceGenerateTool extends StructuredTool {
    name = "voice-generate-openai";
    description = "使用 OpenAI 语音合成，把文本转换成语音，支持指定音色（voice）和模型（model）。返回 base64 音频数据。";
    schema = z.object({
        text: z.string().optional().describe("要合成的文本"),
        instructions: z.string().optional().describe("额外合成风格指令，可选")
    });

    constructor(
        private apiKey: string,
        private baseURL: string,
        private userInput: string,
        private modelName: string, // 可选的模型名称
        private voice: string // 默认音色
    ) { super(); }

    async _call(inputs: { text?: string, instructions?: string }) {
        const openai = new OpenAIClient({
            apiKey: this.apiKey,
            baseURL: this.baseURL,
        });

        const res = await openai.audio.speech.create({
            model: this.modelName,
            voice: this.voice,
            input: this.userInput || inputs.text || "",
            instructions: inputs.instructions || "",
            response_format: "wav"
        });

        const buf = Buffer.from(await res.arrayBuffer());
        return buf.toString("base64"); // 返回base64，前端可 <audio> 播放
    }
}
