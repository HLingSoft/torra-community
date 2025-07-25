import type {
    BuildContext,
    LangFlowNode,
    NodeFactory,
    InputPortVariable,
    OutputPortVariable
} from '~~/types/workflow'
import type { SpeechGenerateEleventlabsData } from '~~/types/node-data/speech-generate-elevenlabs'
import { resolveInputVariables, writeLogs } from '../utils'

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';


export const speechGenerateEleventlabsFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const t0 = performance.now();
    const {
        userInputInputVariable,
        apiKeyInputVariable,

        speed,
        base64VoiceOutputVariable,

        voice,
        title,
        type
    } = node.data as SpeechGenerateEleventlabsData;

    const variableDefs = [userInputInputVariable, apiKeyInputVariable] as InputPortVariable[];
    const inputValues = await resolveInputVariables(context, variableDefs);
    const apiKey = inputValues[apiKeyInputVariable.id];

    const userInput = inputValues[userInputInputVariable.id];

    const elevenlabs = new ElevenLabsClient({
        apiKey
    });

    let result = '';

    try {
        const stream = await elevenlabs.textToSpeech.convert(voice, {
            // modelId: "eleven_v3",

            text: userInput,
            voiceSettings: {
                stability: 1,
                similarityBoost: 1,
                style: 0,
                useSpeakerBoost: true,
                speed: 0.75
            }
        });

        // 2️⃣ 用全局 Response 把 stream 包一层
        const res = new Response(stream as any);

        // 3️⃣ 调用 arrayBuffer()
        const arrayBuffer = await res.arrayBuffer();
        // console.log("arrayBuffer", arrayBuffer);

        // 4️⃣ 转为 Node.js Buffer，再 toString('base64')
        result = Buffer.from(arrayBuffer).toString('base64');
    } catch (error: any) {
        console.error("Error generating voice:", error);
        throw new Error("Failed to generate voice: " + error.message);
    }




    const elapsed = performance.now() - t0;
    writeLogs(
        context,
        node.id,
        title ?? "Eleventlabs Voice Synthesis",
        type ?? "speech-generate-openai",
        {
            [base64VoiceOutputVariable.id]: {
                content: result,
                outputPort: base64VoiceOutputVariable,
                elapsed
            }
        },
        elapsed
    )

    return {
        [base64VoiceOutputVariable.id]: result,

    };
};
