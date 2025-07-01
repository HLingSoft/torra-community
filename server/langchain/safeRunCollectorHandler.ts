import { Run, BaseTracer } from "langchain/callbacks";
import ModelUsageLog from "~/models/ModelUsageLog";
import User from "~/models/User";
import Workflow from "~/models/Workflow";
import { LC } from "~/composables";

/**
 * 在 streaming 与非-streaming 下收集 LLM 调用信息并写日志
 */
export class SafeRunCollectorHandler extends BaseTracer {
    name = "all_run_collector";

    /** streaming 时累积 token 的缓冲区（key = run.id） */
    private tokenBuffers = new Map<string, string>();

    constructor(
        private readonly userId: string,
        private readonly workflowId: string
    ) {
        super();
    }

    /* ----------- Streaming 场景：逐 token 收集 ----------- */
    async onLLMNewToken(run: Run, token: string) {
        const buf = this.tokenBuffers.get(run.id) ?? "";
        this.tokenBuffers.set(run.id, buf + token);
    }

    /* ----------- LLM 结束：写日志 ----------- */
    async onLLMEnd(run: Run) {
        const summary = extractPromptSummary(run.inputs, run.outputs);
        console.log("[SafeRunCollectorHandler] onLLMEnd:", summary.assistantMessage)
        console.dir(run.outputs, { depth: 6, colors: true });
        console.dir(run.outputs?.llmOutput, { depth: 6, colors: true });
        console.dir(run.outputs?.generations?.[0]?.[0], { depth: 4, colors: true });

        // 若是流式且没抽到回复，则用 buffer
        const buffered = this.tokenBuffers.get(run.id) ?? "";
        const assistantMessage =
            summary.assistantMessage || buffered || "";

        this.tokenBuffers.delete(run.id); // 释放内存

        const usage = run.outputs?.llmOutput?.tokenUsage ?? {};
        const model =
            run.extra?.metadata?.ls_model_name ||
            (run.serialized as any)?.kwargs?.model ||
            run.name;
        const baseURL = (run.serialized as any)?.kwargs?.configuration?.baseURL;
        const durationMs =
            typeof run.start_time === "number" && typeof run.end_time === "number"
                ? run.end_time - run.start_time
                : 0;


        /* -------- 逐字段赋值（与你原来的代码一致） -------- */
        const log = new ModelUsageLog();
        log.model = model;
        log.systemPrompt = summary.systemPrompt;
        log.userPrompt = summary.userPrompt;
        log.historyMessages = summary.historyMessages;
        log.assistantMessage = assistantMessage;
        log.promptTokens = usage.promptTokens ?? usage.prompt_tokens ?? 0;
        log.completionTokens = usage.completionTokens ?? usage.completion_tokens ?? 0;
        log.totalTokens = usage.totalTokens ?? usage.total_tokens ?? 0;
        log.durationMs = durationMs;
        log.baseUrl = baseURL;
        log.callType = run.run_type;
        log.user = LC.Object.createWithoutData(User, this.userId);
        log.workflow = LC.Object.createWithoutData(Workflow, this.workflowId);

        await log.save();
    }

    /* ----------- 必须实现的抽象方法 ----------- */
    protected async persistRun(run: Run) {
        /* 如果不需要额外栈逻辑，可留空实现即可通过编译 */
    }
}

/* ============================================================= */

export function extractPromptSummary(inputs: any, outputs: any) {
    /* ---------- 0. 统一获取“角色” ---------- */
    const getType = (m: any): string =>
        (typeof m.getType === "function" ? m.getType() : undefined) ??
        (typeof m._getType === "function" ? m._getType() : undefined) ??
        (typeof m.role === "string" ? m.role : undefined) ??
        "";

    /* ---------- 1. 拿 prompt ---------- */
    let messages: any[] = [];
    if (Array.isArray(inputs?.messages)) {
        messages = Array.isArray(inputs.messages[0])
            ? (inputs.messages[0] as any[])
            : (inputs.messages as any[]);
    }
    const isChat = messages.length > 0;

    const prompts: string[] =
        inputs?.prompts ??
        (typeof inputs?.prompt === "string" ? [inputs.prompt] : []);

    /* ---------- 2. 初始化 ---------- */
    let systemPrompt = "";
    let userPrompt = "";
    let historyMessages = "";
    const assistantMessages: string[] = [];

    /* ---------- 3. ChatPrompt ---------- */
    if (isChat) {
        systemPrompt =
            messages.find(m => getType(m) === "system")?.content ?? "";

        for (let i = messages.length - 1; i >= 0; i--) {
            const t = getType(messages[i]);
            if (t === "human" || t === "user") {
                userPrompt = messages[i].content ?? "";
                break;
            }
        }

        const historyLines: string[] = [];
        for (let i = 0; i < messages.length - 1; i++) {
            const t = getType(messages[i]);
            if (["human", "user", "ai", "assistant"].includes(t)) {
                historyLines.push(`[${t}]: ${messages[i].content}`);
                if (t === "ai" || t === "assistant") {
                    assistantMessages.push(messages[i].content);
                }
            }
        }
        historyMessages = historyLines.join("\n");
    } else if (prompts.length) {
        /* ---------- 4. 纯字符串 prompt ---------- */
        userPrompt = prompts[prompts.length - 1];
        historyMessages = prompts.slice(0, -1).join("\n");
    }
    /* ---------- 5. 本轮 AI 回复（function_call + tool_calls + streaming 兜底） ---------- */
    const firstGen =
        outputs?.generations?.[0]?.[0] ??      // Chat（双层）
        outputs?.generations?.[0];             // Text（单层）

    let assistantMessage = "";

    /* -- A. ChatGeneration.message -- */
    if (firstGen?.message) {
        const msg: any = firstGen.message;

        // 1) 普通内容
        assistantMessage = (msg.content ?? "").trim();

        // 2) function_call
        if (!assistantMessage && msg.additional_kwargs?.function_call) {
            assistantMessage = JSON.stringify(msg.additional_kwargs.function_call);
        }
        if (!assistantMessage && msg.function_call) {
            assistantMessage = JSON.stringify(msg.function_call);
        }

        // 3) tool_calls（数组）
        if (!assistantMessage && msg.additional_kwargs?.tool_calls?.length) {
            assistantMessage = JSON.stringify(msg.additional_kwargs.tool_calls);
        }
        if (!assistantMessage && msg.tool_calls?.length) {
            assistantMessage = JSON.stringify(msg.tool_calls);
        }
    }

    /* -- B. generation 直接带 tool_calls / function_call -- */
    if (!assistantMessage && firstGen?.tool_calls?.length) {
        assistantMessage = JSON.stringify(firstGen.tool_calls);
    }
    if (!assistantMessage && firstGen?.function_call) {
        assistantMessage = JSON.stringify(firstGen.function_call);
    }

    /* -- C. streaming=true 时信息在 llmOutput.tool / tool_calls -- */
    const lo: any = outputs?.llmOutput;
    if (!assistantMessage && (lo?.tool || lo?.tool_calls)) {
        assistantMessage = JSON.stringify(lo.tool ?? lo.tool_calls);
    }

    /* -- D. 兜底：text LLM -- */
    if (!assistantMessage) {
        assistantMessage = (firstGen?.text ?? "").trim();
    }



    return {
        systemPrompt,
        userPrompt,
        historyMessages,
        assistantMessages,
        assistantMessage,
    };
}
