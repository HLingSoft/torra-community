import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable,
    OutputPortVariable
} from '~/types/workflow'
import type { SpeechGenerateOpenAIData } from '~/types/node-data/speech-generate-openai'
import { resolveInputVariables, wrapRunnable, writeLogs, updatePortLog } from '../utils'
import { RunnableLambda } from "@langchain/core/runnables";
import { OpenAIClient } from "@langchain/openai";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";

export const speechGenerateOpenAIFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const t0 = performance.now();
    const {
        userInputInputVariable,
        apiKeyInputVariable,
        baseURLInputVariable,
        toolOutputVariable,
        base64VoiceOutputVariable,
        instructionInputVariable,
        modelName,
        voice,
        title,
        type
    } = node.data as SpeechGenerateOpenAIData;

    const variableDefs = [userInputInputVariable, apiKeyInputVariable, baseURLInputVariable] as InputPortVariable[];
    const inputValues = await resolveInputVariables(context, variableDefs);
    const apiKey = inputValues[apiKeyInputVariable.id];
    const baseURL = inputValues[baseURLInputVariable.id];
    const userInput = inputValues[userInputInputVariable.id];
    const instruction = inputValues[instructionInputVariable?.id] || "";

    const openai = new OpenAIClient({ apiKey, baseURL });

    const response = await openai.audio.speech.create({
        model: modelName,
        voice,
        input: userInput,
        instructions: instruction,
        response_format: "wav"
    });

    const voiceGenerateChain = RunnableLambda.from(async () => {
        const buffer = Buffer.from(await response.arrayBuffer());
        return buffer.toString("base64");
    });

    const wrappedBase64 = wrapRunnable(
        voiceGenerateChain,
        node.id,


        {
            context,
            portId: base64VoiceOutputVariable.id,
            logFormat: res => ({
                type: "openai-voice-base64",
                data: res
            }),
            outputPort: base64VoiceOutputVariable
        }
    );

    const tool = new OpenAIVoiceGenerateTool(
        apiKey,
        baseURL,
        userInput,
        modelName,
        voice,
        context,
        node.id,
        base64VoiceOutputVariable.id,

    );
    const elapsed = performance.now() - t0;
    writeLogs(
        context,
        node.id,
        title ?? "OpenAI Voice Synthesis",
        type ?? "speech-generate-openai",
        {
            [base64VoiceOutputVariable.id]: {
                content: "OpenAI Voice Synthesis Output",
                outputPort: base64VoiceOutputVariable,
                elapsed
            },
            [toolOutputVariable.id]: {
                content: "OpenAI Voice Generate Tool",
                outputPort: toolOutputVariable,
                elapsed
            }
        },
        elapsed
    )

    return {
        [base64VoiceOutputVariable.id]: wrappedBase64,
        [toolOutputVariable.id]: tool
    };
};


// -------- Tool 实现 --------
class OpenAIVoiceGenerateTool extends StructuredTool {
    name = "voice-generate-openai";
    description = "使用 OpenAI 语音合成，把文本转换成语音，支持指定音色和模型，返回 base64 音频数据。";
    schema = z.object({
        text: z.string().optional().describe("要合成的文本"),
        instructions: z.string().optional().describe("合成风格说明，可选"),
    });

    constructor(
        private apiKey: string,
        private baseURL: string,
        private defaultInput: string,
        private modelName: string,
        private voice: string,
        private context: BuildContext,
        private nodeId: string,
        private portId: string,

    ) {
        super();
    }

    async _call(inputs: { text?: string; instructions?: string }) {
        const t0 = performance.now();

        const openai = new OpenAIClient({
            apiKey: this.apiKey,
            baseURL: this.baseURL,
        });

        const inputText = this.defaultInput || inputs.text || "";
        const instructionText = inputs.instructions || "";

        const res = await openai.audio.speech.create({
            model: this.modelName,
            voice: this.voice,
            input: inputText,
            instructions: instructionText,
            response_format: "wav",
        });

        const buffer = Buffer.from(await res.arrayBuffer());
        const base64 = buffer.toString("base64");
        const elapsed = performance.now() - t0;

        updatePortLog(
            this.context,
            this.nodeId,
            this.portId,
            {
                content: {
                    type: "openai-voice-base64",
                    data: base64.slice(0, 100) + '...',
                },
                elapsed
            },


        );

        return base64;
    }
}
