import { createHooks } from "hookable"

export interface SSEHooks {
  "sse:event": (data: any) => any | void
}

export const sseHooks = createHooks<SSEHooks>()
