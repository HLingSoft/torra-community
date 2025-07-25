
import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import type { LangFlowNode, BuildContext, OutputPortVariable } from '~~/types/workflow'
import type { SpeechRecognitionOpenAIData } from '~~/types/node-data/speech-recognition-openai'
import { resolveInputVariables, writeLogs } from '../utils'
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
    const t0 = performance.now();
    const {
        apiKeyInputVariable,
        baseURLInputVariable,
        languageModelName,
        instructionInputVariable,
        voiceDataInputVariable,
        outputVariable,
        toolOutputVariable,
        title,
        type
    } = node.data as SpeechRecognitionOpenAIData;

    const inputValues = await resolveInputVariables(context, [
        apiKeyInputVariable,
        baseURLInputVariable,
        voiceDataInputVariable
    ]);

    const apiKey = inputValues[apiKeyInputVariable.id];
    const baseURL = inputValues[baseURLInputVariable.id];
    const inputAudio = inputValues[voiceDataInputVariable.id];
    const instructions = inputValues[instructionInputVariable?.id] || "";


    try {


        const { buf, fileName } = await toBufferAndFileName(inputAudio, node.id);
        const file = await toFile(buf, fileName);

        const openai = new OpenAIClient({ apiKey, baseURL });
        // const resp = await openai.audio.transcriptions.create({
        //     file,
        //     model: "gpt-4o-transcribe",
        //     language: languageModelName || undefined,
        //     response_format: "json",

        //     prompt: instructions || undefined
        // });
        //        const text = resp.text;
        // console.log("OpenAI ASR Response:", text);
        const resp = await openai.audio.transcriptions.create({
            file,
            model: "whisper-1",
            language: languageModelName || undefined,
            response_format: "srt",
            prompt: instructions || undefined
        });
        const text = resp;  // 这是一个 SRT 字幕文本字符串
        // console.log("OpenAI Whisper SRT Response:", text);





        const tool = new OpenAIWhisperTool(
            apiKey,
            baseURL,
            languageModelName,
            instructions,
            context,
            node.id,
            outputVariable,
            title,
            type
        );

        const elapsed = performance.now() - t0;
        writeLogs(
            context,
            node.id,
            title ?? "OpenAI Whisper ASR",
            type ?? "speech-recognition-openai",
            {
                [outputVariable.id]: {
                    content: text,
                    outputPort: outputVariable,
                    elapsed
                },
                [toolOutputVariable.id]: {
                    content: "OpenAI Whisper ASR Tool",
                    outputPort: toolOutputVariable,
                    elapsed
                }
            },
            elapsed
        );

        return {
            [outputVariable.id]: text,
            [toolOutputVariable.id]: tool
        };
    } catch (error: any) {
        console.error("OpenAI ASR Error:", error);
        throw new Error(`OpenAI ASR 识别失败: ${error.message}`);
    }


}


// Agent Tool
class OpenAIWhisperTool extends StructuredTool {
    name = "openai-whisper-asr";
    description = "识别音频（base64 或 url），输出文字";
    schema = z.object({
        data: z.string().describe("base64 音频或 https 音频 URL"),
        language: z.string().optional().describe("可选语言代码，如 zh、en"),
        prompt: z.string().optional().describe("可选的上下文提示"),
    });

    constructor(
        private apiKey: string,
        private baseURL: string,
        private modelLanguage?: string,
        private defaultPrompt?: string,
        private context?: BuildContext,
        private nodeId?: string,
        private outputPort?: OutputPortVariable,
        private title?: string,
        private type?: string
    ) {
        super();
    }

    async _call(inputs: { data: string; language?: string; prompt?: string }) {
        const t0 = performance.now();

        const { buf, fileName } = await toBufferAndFileName(inputs.data, Math.random().toString(36).slice(2));
        const file = await toFile(buf, fileName);

        const openai = new OpenAIClient({ apiKey: this.apiKey, baseURL: this.baseURL });
        const resp = await openai.audio.transcriptions.create({
            file,
            model: "gpt-4o-transcribe",
            language: inputs.language || this.modelLanguage || undefined,
            response_format: "json",
            prompt: inputs.prompt || this.defaultPrompt || undefined
        });

        const text = resp.text;
        const elapsed = performance.now() - t0;

        if (this.context && this.nodeId && this.outputPort) {
            writeLogs(
                this.context,
                this.nodeId,
                this.title ?? "OpenAI Whisper ASR",
                this.type ?? "openai-whisper-asr",
                {
                    [this.outputPort.id]: {
                        content: text,
                        outputPort: this.outputPort,
                        elapsed
                    }
                },
                elapsed
            );
        }

        return text;
    }
}
