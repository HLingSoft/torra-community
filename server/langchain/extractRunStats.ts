import type { Run } from "langchain/callbacks";

/* ---------- 类型 ---------- */
export interface RunStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
}

/* ---------- 把一棵树拉平 ---------- */
function flattenRuns(runs: Run[]): Run[] {
  const all: Run[] = [];
  const walk = (r: Run) => {
    all.push(r);
    r.child_runs?.forEach(walk);
  };
  runs.forEach(walk);
  return all;
}

/* ---------- 主函数：根 → 汇总 ---------- */
export function extractRunStats(roots: Run[]): RunStats {
  /* 1. 把所有根树扁平化 */
  const all = roots.flatMap(r => flattenRuns([r]));

  /* 2. token & 时间累加 */
  let prompt = 0, completion = 0, total = 0, duration = 0;

  for (const run of all) {
    // token
    if (run.run_type === "llm" || run.run_type === "embedding") {
      const u =
        run.outputs?.llmOutput?.tokenUsage ??
        run.outputs?.embeddingOutput?.tokenUsage ??
        run.extra?.usage;
      if (u) {
        prompt += u.promptTokens ?? u.prompt_tokens ?? 0;
        completion += u.completionTokens ?? u.completion_tokens ?? 0;
        total += u.totalTokens ?? u.total_tokens ?? 0;
      }
    }
    // 耗时
    if (run.start_time && run.end_time) {
      duration += run.end_time - run.start_time;
    }
  }

  /* 3. 从“第一棵根 run 的 inputs.messages”里解析三段 prompt */
  let systemPrompt = "", historyPrompt = "", userPrompt = "";
  const firstRoot = roots[0];
  const msgs: any[] | undefined = firstRoot?.inputs?.messages as any[];

  if (Array.isArray(msgs)) {
    const systems = msgs.filter(m => m.role === "system").map(m => m.content);
    const users = msgs.filter(m => m.role === "user").map(m => m.content);
    systemPrompt = systems[0] ?? "";
    userPrompt = users.at(-1) ?? "";
    historyPrompt = msgs
      .filter(m => !["system", "user"].includes(m.role))
      .map(m => m.content)
      .join("\n");
  }

  /* 4. 返回汇总对象 */
  return {
    promptTokens: prompt,
    completionTokens: completion,
    totalTokens: total,
    durationMs: duration,

  };
}
