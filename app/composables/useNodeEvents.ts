// composables/useNodeEvents.ts
import { createEventHook } from '@vueuse/core'

/** 触发 “让 id 对应的节点执行 doDuplicate” */
const duplicateHook = createEventHook<string>()   // payload = nodeId
/** 触发 “把 nodeId 记为 clipboard” */
const copyHook = createEventHook<string>()

export function useNodeEvents() {
    return {
        /* 监听 */
        onDuplicateNode: duplicateHook.on,
        onCopyNode: copyHook.on,
        /* 触发 */
        triggerDuplicateNode: duplicateHook.trigger,
        triggerCopyNode: copyHook.trigger,
    }
}
