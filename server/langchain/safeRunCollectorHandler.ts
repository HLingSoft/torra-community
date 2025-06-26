import { Run, BaseTracer } from "langchain/callbacks";
import ModelUsageLog from "~/models/ModelUsageLog";
import User from "~/models/User";
import Workflow from "~/models/Workflow";
import { LC } from "~/composables";



export class SafeRunCollectorHandler extends BaseTracer {
    name = "all_run_collector";
    runs: Run[] = [];

    constructor(
        private readonly userId: string,
        private readonly workflowId: string
    ) {
        super();
    }
    // async onToolStart(run: Run) {
    //     console.log("onToolStart", run.name, run.inputs, run.outputs);
    // }
    async onToolEnd(run: Run) {
        console.log("onToolEnd", run.name, run.inputs, run.outputs);
    }
    /* LLM 结束时调用 */
    async onLLMEnd(run: Run) {
        console.log("onLLMEnd", run.name, run.inputs, run.outputs);

        const inputs = run.inputs;
        const usage = run.outputs?.llmOutput?.tokenUsage ?? {};

        // 用刚刚的函数解析 prompt
        const { systemPrompt, userPrompt, historyMessages, assistantMessages } = extractPromptSummary(inputs);

        // output 内容可以用上面 extractLLMReply（或者 assistantMessages 最后一条）
        const output = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : undefined;

        const model = run.extra?.metadata?.ls_model_name || (run.serialized as any)?.kwargs?.model || run.name;
        const baseURL = (run.serialized as any)?.kwargs?.configuration?.baseURL;
        const durationMs = typeof run.start_time === "number" && typeof run.end_time === "number" ? run.end_time - run.start_time : 0;

        const log = new ModelUsageLog();
        log.model = model;
        log.systemPrompt = systemPrompt;
        log.userPrompt = userPrompt;
        log.historyMessages = historyMessages;
        log.assistantMessage = output; // 你可以存 assistantMessages.join('\n') 或只存最后一句
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

    protected async persistRun(run: Run) {
        if (!run.parent_run_id) this.runs.push(run);
    }
}
function extractPromptSummary(inputs: any) {
    const all = (inputs?.messages?.[0] ?? []) as any[];

    // systemPrompt = 第一个 system
    const systemPrompt = all.find(msg => msg.role === "system" || (msg.constructor?.name?.includes("System")))?.content ?? "";

    // userPrompt = 最后一个 human/user
    const lastUserIdx = [...all].reverse().findIndex(msg => ["user", "human"].includes(msg.role) || (msg.constructor?.name?.includes("Human")));
    const userPromptIdx = lastUserIdx !== -1 ? all.length - 1 - lastUserIdx : -1;
    const userPrompt = userPromptIdx !== -1 ? all[userPromptIdx]?.content ?? "" : "";

    // assistantMessages = 所有 assistant/AI
    const assistantMessages = all.filter(msg =>
        msg.role === "assistant" || msg.constructor?.name?.includes("AI")).map(msg => msg.content);

    // 组合历史对话（除去 system + 当前最后一轮问答）
    // 只保留前面的内容，且分角色存储
    let history = [];
    for (let i = 0; i < all.length - 2; i++) {
        const msg = all[i];
        if (["human", "user", "assistant", "AI"].includes(msg.role) || (msg.constructor?.name?.includes("Human") || msg.constructor?.name?.includes("AI"))) {
            history.push(`[${msg.role || msg.constructor?.name}]: ${msg.content}`);
        }
    }
    const historyMessages = history.join("\n");

    return { systemPrompt, userPrompt, historyMessages, assistantMessages };
}
