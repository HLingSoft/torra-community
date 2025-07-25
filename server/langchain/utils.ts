import type { InputPortVariable, OutputPortVariable, LangFlowEdge, BuildContext, LangFlowJson, DAGStepInfo, PortLog } from '~~/types/workflow'

import { useJSONStringify } from '~/composables'
export function stringifyForDisplay(val: any): string {
  // 1. Markdown / 纯文本
  if (typeof val === 'string') return val

  // 2. 原始标量
  if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
    return String(val)
  }

  // 3. 纯字符串数组 → 换行拼接
  if (Array.isArray(val) && val.every(v => typeof v === 'string')) {
    return val.join('\n')
  }

  // 4. 其他情况走 superjson（带 2 空格缩进）
  const json = useJSONStringify(val)
  return JSON.stringify(JSON.parse(json), null, 2)
}

/**
 * 判断某节点的指定 output port 是否连到其他节点
 *
 * @param edges   全部连线（LangFlowEdge[]）
 * @param nodeId  当前节点 id（edge.source）
 * @param portId  output port id；如果节点只有一个默认口可传 undefined
 * @returns       true = 至少有一条边连出；false = 没连
 */
export function isOutputPortConnected(
  edges: LangFlowEdge[],
  nodeId: string,
  portId: string
): boolean {
  const handle = portId
  return edges.some(
    e =>
      e.source === nodeId &&
      (e.sourceHandle) === handle
  )
}
export async function resolveInputVariables(
  context: BuildContext,
  variables: InputPortVariable[]
): Promise<Record<string, any>> {

  const vals: Record<string, any> = {}
  /**
   * 解析 torra_ 变量：
   * 1. 字符串以 "torra_" 开头 → 在作用域栈里查同名变量，找到就替换
   * 2. 值是数组               → 递归处理每个元素
   * 3. 其他类型               → 原样返回
   */
  function resolveTorra(value: unknown): any {
    // ---------- 1. 单个字符串 ----------
    if (typeof value === 'string' && value.startsWith('torra_')) {
      const name = value                                   // 变量名本身
      // ❶ 从栈顶向下查找，谁先定义用谁
      for (let i = context.variables.length - 1; i >= 0; i--) {
        const scope = context.variables[i]
        if (name in scope) return scope[name]
      }
      return value   // 没找到就保留原字符串
    }

    // ---------- 2. 数组：递归解析 ----------
    if (Array.isArray(value)) {
      return value.map(resolveTorra)
    }

    // ---------- 3. 其他类型 ----------
    return value
  }

  for (const v of variables) {
    if (!v || !v.id) continue

    const rawInput = context.resolvedInput[v.id]
    const fallback = v.value ?? v.defaultValue ?? ''

    let val: any

    if (v.connected) {
      if (rawInput !== undefined) {
        val = rawInput          // 始终保留原始数组或标量
      } else {
        val = fallback
      }
    } else {
      val = fallback
    }

    // torra_ 变量替换（支持数组）
    val = resolveTorra(val)

    vals[v.id] = val
  }

  return vals
}


export function collectLoopBodyNodes(
  json: LangFlowJson,
  loopId: string,
  itemPortId: string,
  itemResultPortId: string
): Set<string> {
  const endNodes = json.edges
    .filter(e => e.source === loopId && e.sourceHandle === itemResultPortId)
    .map(e => e.target)

  const body = new Set<string>()
  const stack = json.edges
    .filter(e => e.source === loopId && e.sourceHandle === itemPortId)
    .map(e => e.target)

  while (stack.length) {
    const nid = stack.pop()!
    if (nid === loopId || body.has(nid)) continue
    body.add(nid)
    if (endNodes.includes(nid)) continue
    json.edges.filter(e => e.source === nid).forEach(e => stack.push(e.target))
  }

  endNodes.forEach(n => body.add(n))
  return body
}
export function contextLogsToSteps(
  context: BuildContext,
  total: number
): DAGStepInfo[] {
  const steps: DAGStepInfo[] = []

  Object.entries(context.logs).forEach(([nodeId, nodeLog], idx) => {
    const { title, type } = nodeLog

    // ✅ 只处理真正的端口字段
    const ports = Object.entries(nodeLog)
      .filter(([k, v]) => typeof v === 'object' && v && 'outputType' in v && 'id' in v)
      .map(([portId, val]) => {
        return {
          portId,
          elapsed: val.elapsed ?? 0,
          elapsedStr: val.elapsed != null
            ? (val.elapsed < 1000 ? `${val.elapsed.toFixed(1)}ms` : `${(val.elapsed / 1000).toFixed(2)}s`)
            : '-',
          content: useJSONStringify(val.content),
          timestamp: val.timestamp ?? Date.now(),
          name: val.name ?? portId,
          outputType: val.outputType ?? 'unknown',
          id: val.id ?? portId

        }
      })

    steps.push({
      index: idx + 1,
      total,
      nodeId,
      nodeTitle: title,
      nodeType: type,
      ports,
      elapsed: nodeLog.elapsed ?? -1, // 若缺省则给 -1
      error: nodeLog.error, // 错误信息

    })

  })

  return steps
}

const MAX_LOG_LENGTH = 2000
export function writeLogs(
  context: BuildContext,
  nodeId: string,
  title: string,
  type: string,
  logsPerPort: Record<string, PortLog>,
  elapsed?: number,
  extra?: Record<string, any> // ✅ 新增参数：可用于传入 loopContext 等上下文信息
) {
  const logs = (context.logs ??= {})
  const nodeLogs = (logs[nodeId] ??= {})
  nodeLogs.title = title
  nodeLogs.type = type
  nodeLogs.elapsed =
    typeof elapsed === 'number'
      ? (typeof nodeLogs.elapsed === 'number' && nodeLogs.elapsed > 0
        ? nodeLogs.elapsed + elapsed
        : elapsed)
      : nodeLogs.elapsed ?? -1

  // ✅ 记录额外上下文信息（如 loopContext）
  if (extra && typeof extra === 'object') {
    Object.assign(nodeLogs, extra)
  }
  /** 
 * 取工作流的全部连线。
 * - 如果 BuildContext 本身带有 `edges` 字段就直接用；
 * - 否则从 context.json?.edges 兜底；再不行就给空数组。
 */
  const edges = (context as any).edges
    ?? (context as any).json?.edges
    ?? []


  for (const portId in logsPerPort) {
    const { content, outputPort, elapsed } = logsPerPort[portId]
    // ✨ 只记录「连出去」的 output port
    const connected = isOutputPortConnected(edges, nodeId, outputPort.id ?? portId)
    if (!connected) continue
    const trimmedContent =
      typeof content === 'string' && content.length > MAX_LOG_LENGTH
        ? content.slice(0, MAX_LOG_LENGTH)
        : content

    nodeLogs[portId] = {
      content: trimmedContent,
      name: outputPort.name,
      outputType: outputPort.outputType,
      id: outputPort.id,
      timestamp: Date.now(),
      ...(elapsed != null ? { elapsed } : {}),

    }
  }
}

export function updatePortLog(
  context: BuildContext,
  nodeId: string,
  portId: string,
  data: Partial<Pick<PortLog, 'content' | 'elapsed' | 'timestamp'>>
) {
  const logs = (context.logs ??= {})
  const nodeLogs = (logs[nodeId] ??= {})

  const existing = nodeLogs[portId] ?? {}

  const trimmedContent =
    typeof data.content === 'string' && data.content.length > MAX_LOG_LENGTH
      ? data.content.slice(0, MAX_LOG_LENGTH)
      : data.content

  nodeLogs[portId] = {
    ...existing,
    ...data,
    ...(trimmedContent !== undefined ? { content: trimmedContent } : {})
  }
}

export async function financeConsume(context: BuildContext, note: string, cost: number) {
  await fetch('https://api.torra.cloud/api/finance/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: context.userId,
      workflowId: context.workflowId,
      note,
      cost

    })
  })

}

export async function financeBalance(context: BuildContext) {
  const result = await fetch('https://api.torra.cloud/api/finance/balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: context.userId,
    })
  })
  //如果返回的状态码不是 200，则抛出错误
  if (!result.ok) {
    throw new Error(`余额不足`)
  }

}




/**
 * 将远程文件下载并转为 base64 字符串
 */
export const fetchToBase64 = async (url: string, retry = 3): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30 s

  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.toString('base64');
  } catch (err) {
    if (retry > 0) {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 700)); // 0.3–1 s 退避
      return fetchToBase64(url, retry - 1);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
/**
 * 将 ReadableStream 转为 base64 字符串
 */
export const streamToBase64 = async (stream: ReadableStream): Promise<string> => {
  const reader = stream.getReader()
  const chunks: Buffer[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(Buffer.from(value))
  }
  return Buffer.concat(chunks).toString('base64')
}
