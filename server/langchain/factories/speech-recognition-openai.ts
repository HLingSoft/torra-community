import { RunnableLambda } from "@langchain/core/runnables";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import type { LangFlowNode, BuildContext } from '~/types/workflow'
import type { SpeechRecognitionOpenAIData } from '@/types/node-data/speech-recognition-openai'
import { resolveInputVariables, writeLog, wrapRunnable } from '../resolveInput'
import { OpenAIClient, toFile } from "@langchain/openai";


/** 判断是否 http(s) url */
function isHttpUrl(str: string): boolean {
    return /^https?:\/\/[^\s]+$/i.test(str);
}
/** base64 字符串转 Buffer */
function base64ToBuffer(b64: string): Buffer {
    return Buffer.from(b64, "base64");
}
/** 下载远程 URL 并转为 Buffer */
async function fetchUrlToBuffer(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("下载失败: " + res.statusText);
    const buf = await res.arrayBuffer();
    return Buffer.from(buf);
}
/** 输入可能为 base64 或 url，统一转为 Buffer + fileName */
async function toBufferAndFileName(input: string, id: string, extDefault = 'wav') {
    let buf: Buffer;
    let ext = extDefault;
    let fileName = `${Date.now()}_${id}.${ext}`;
    if (isHttpUrl(input)) {
        buf = await fetchUrlToBuffer(input);
        ext = input.split('.').pop()?.split(/\?|#/)[0] || extDefault;
        fileName = `${Date.now()}_${id}.${ext}`;
    } else {
        buf = base64ToBuffer(input);
    }
    return { buf, fileName };
}

// 节点工厂
export const speechRecognitionOpenAIFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const { apiKeyInputVariable, languageModelName, baseURLInputVariable, instructionInputVariable, voiceDataInputVariable, outputVariable, toolOutputVariable } = node.data as SpeechRecognitionOpenAIData;

    const inputValues = await resolveInputVariables(context, [apiKeyInputVariable, voiceDataInputVariable, baseURLInputVariable]);
    const apiKey = inputValues[apiKeyInputVariable.id];
    const inputAudio = inputValues[voiceDataInputVariable.id];
    const baseURL = inputValues[baseURLInputVariable.id];
    const instructions = inputValues[instructionInputVariable.id] || "";


    const openai = new OpenAIClient({
        apiKey,
        baseURL,
    });

    const asrChain = RunnableLambda.from(async () => {
        const { buf, fileName } = await toBufferAndFileName(inputAudio, node.id);
        const file = await toFile(buf, fileName);
        const resp = await openai.audio.transcriptions.create({
            file,
            model: "gpt-4o-transcribe",
            language: languageModelName || undefined,
            response_format: "json",
            prompt: instructions || undefined
        });
        return resp.text;
    });

    // 创建 Tool 实例
    const tool = new OpenAIWhisperTool(apiKey, baseURL);

    // 包装成 runnable
    const wrapped = wrapRunnable(
        asrChain,
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: outputVariable.id,
            logFormat: res => ({
                type: "openai-asr",
                data: res
            })
        }
    );

    return {
        [outputVariable.id]: wrapped,
        [toolOutputVariable.id]: tool
    }
}

// Tool 封装，给 agent 用
class OpenAIWhisperTool extends StructuredTool {
    name = "openai-whisper-asr";
    description = "识别音频（base64或url），输出文字";
    schema = z.object({
        data: z.string().describe("base64音频或https音频url"),
        language: z.string().optional().describe("可选语言代码，如zh、en等"),
    });

    constructor(private apiKey: string, private baseURL?: string, private languageModelName?: string, private prompt?: string) { super(); }

    async _call(inputs: { data: string; language?: string, prompt?: string }) {
        const { buf, fileName } = await toBufferAndFileName(inputs.data, Math.random().toString(36).slice(2));
        const file = await toFile(buf, fileName);

        const openai = new OpenAIClient({
            apiKey: this.apiKey,
            baseURL: this.baseURL
        });

        const resp = await openai.audio.transcriptions.create({
            file,
            model: "gpt-4o-transcribe",
            language: inputs.language || this.languageModelName || undefined,
            response_format: "json",
            prompt: inputs.prompt || this.prompt || undefined
        });
        return resp.text;
    }
}
