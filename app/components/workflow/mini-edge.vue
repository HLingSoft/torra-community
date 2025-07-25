<script setup lang="ts">
import { StepEdge, useVueFlow } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'
import { computed, nextTick, onMounted, watch, ref } from 'vue'
import { useColorMode } from '#imports'

const props = defineProps<EdgeProps>()

// —— 取 handleId / getHandleEl / readColor —— 
function handleId(side: 'source' | 'target') {
    return side === 'source' ? props.sourceHandleId : props.targetHandleId
}
function getHandleEl(nodeId: string, hId?: string | null) {
    return hId
        ? (document.querySelector(
            `[data-nodeid="${nodeId}"][data-handleid="${hId}"]`
        ) as HTMLElement | null)
        : null
}
function readColor(nodeId: string, hId?: string | null) {
    const el = getHandleEl(nodeId, hId)
    if (!el) return '#000'
    const inline = (el.style.backgroundColor || el.style.background || '').trim()
    if (inline) return inline
    const css = getComputedStyle(el)
    return (
        css.getPropertyValue('--handle-bg').trim() ||
        css.getPropertyValue('--vf-handle-color').trim() ||
        css.backgroundColor ||
        '#000'
    )
}

// —— 触发刷新用的“版本号”ref —— 
const version = ref(0)
// Nuxt Color Mode
const colorMode = useColorMode()

// computed 里显式依赖 version 和 colorMode.value
const strokeColor = computed(() => {
    void version.value      // 触发依赖
    void colorMode.value    // 主题切换也触发
    return readColor(props.target, handleId('target'))
})

// Vue Flow 拖拽/节点变化钩子
const { onNodeDrag, onNodeDragStop, onNodesChange } = useVueFlow()
function refresh() {
    // 等下一帧 DOM、样式都更新完
    nextTick(() => {
        version.value += 1
    })
}
onMounted(refresh)
onNodeDrag(refresh)
onNodeDragStop(refresh)
onNodesChange(refresh)

// 主题切换时也调用
watch(colorMode, refresh)
</script>

<template>
    <StepEdge v-bind="props" :style="{
        stroke: strokeColor,
        strokeWidth: 2,
    }" />
</template>
