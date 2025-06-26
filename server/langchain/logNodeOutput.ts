// utils/langchain/logNodeOutput.ts

import type { BuildContext } from '~/types/workflow'

import { toJsonSafe } from './utils'

interface LogOptions {
    portId?: string
    elapsed?: number
    type?: string
    title?: string
    timestamp?: number
    runStats?: {
        promptTokens?: number
        completionTokens?: number
        totalTokens?: number
        durationMs?: number
    }
    error?: string
}

/**
 * 更结构化的日志记录器
 */
export function logNodeOutput(
    context: BuildContext,
    nodeId: string,
    title: string,
    type: string,
    content: any,
    options: LogOptions = {}
) {
    const logs = (context.logs ??= {})
    const nodeLog = (logs[nodeId] ??= {})

    // 强制写入 title 和 type（用于后续组装 DAGStepInfo）
    nodeLog.title = title ?? '未命名'
    nodeLog.type = type ?? 'unknown'

    const safeContent = toJsonSafe(content)

    const logItem = {
        content: safeContent,
        ...(options.portId && { portId: options.portId }),
        ...(options.type && { type: options.type }),
        ...(options.elapsed !== undefined && { elapsed: options.elapsed }),
        ...(options.timestamp && { timestamp: options.timestamp }),
        ...(options.runStats && { runStats: options.runStats }),
        ...(options.error && { error: options.error }),
    }

    const key = options.portId ?? 'default'
    nodeLog[key] = logItem
}
