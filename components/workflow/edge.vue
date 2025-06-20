<script setup lang="ts">
import { BezierEdge, useVueFlow } from '@vue-flow/core'
import { onMounted, watchEffect } from 'vue'
import type { EdgeProps } from '@vue-flow/core'

/*
 * GradientBezierEdge.vue – 极简稳定版
 * ------------------------------------------------------------
 * • 不再额外声明接口，只用 EdgeProps 再加两个可选 Id 字段。
 * • 渐变用 objectBoundingBox，完全不用算坐标，绝对不串色。
 */

const props = defineProps<EdgeProps>()

const gradId = `grad-${props.id}`

// ------------------------------ 取色 ------------------------------
function handleId(side: 'source' | 'target') {
  return side === 'source' ? props.sourceHandleId : props.targetHandleId
}

function getHandleEl(nodeId: string, hId?: string | null) {
  return hId ? (document.querySelector(`[data-nodeid="${nodeId}"][data-handleid="${hId}"]`) as HTMLElement | null) : null
}

function readColor(nodeId: string, hId?: string | null) {
  const el = getHandleEl(nodeId, hId)
  if (!el) return '#ffffff'

  const inline = (el.style.backgroundColor || el.style.background || '').trim()
  if (inline) return inline

  const css = getComputedStyle(el)
  return (
    css.getPropertyValue('--handle-bg').trim() ||
    css.getPropertyValue('--vf-handle-color').trim() ||
    css.backgroundColor ||
    '#ffffff'
  )
}

// --------------------------- 渐变生成 / 更新 ---------------------------
function ensureGradient() {
  const svg = document.querySelector('svg.vue-flow__edges') as SVGSVGElement | null
  if (!svg) return

  // <defs>
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.prepend(defs)
  }

  // <linearGradient>
  let grad = defs.querySelector(`#${gradId}`) as SVGLinearGradientElement | null
  if (!grad) {
    grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    grad.id = gradId
    grad.setAttribute('gradientUnits', 'objectBoundingBox')
    grad.setAttribute('x1', '0%')        // 起点
    grad.setAttribute('y1', '50%')
    grad.setAttribute('x2', '100%')      // 终点 >100% 让粉色更长
    grad.setAttribute('y2', '50%')
    grad.innerHTML = '<stop offset="0%"/><stop offset="100%"/>'
    defs.appendChild(grad)
  }

  const [s0, s1] = grad.querySelectorAll('stop') as unknown as SVGStopElement[]
  if (!s0 || !s1) return

  // 👉 判断连线方向：源节点在右侧则需要反转颜色
  const reversed = (props as any).sourceX > (props as any).targetX

  if (!reversed) {
    s0.setAttribute('stop-color', readColor(props.source, handleId('source')))
    s1.setAttribute('stop-color', readColor(props.target, handleId('target')))
  } else {
    s0.setAttribute('stop-color', readColor(props.target, handleId('target')))
    s1.setAttribute('stop-color', readColor(props.source, handleId('source')))
  }
}

// --------------------------- 刷新钩子 ---------------------------
const { onNodeDrag, onNodeDragStop, onNodesChange } = useVueFlow()
const refresh = () => ensureGradient()

onMounted(refresh)
onNodeDrag(refresh)
onNodeDragStop(refresh)
onNodesChange(refresh)
watchEffect(refresh)
</script>

<template>
  <!-- @vue-ignore -->
  <BezierEdge v-bind="props" :style="{ stroke: `url(#${gradId})`, strokeWidth: 4 }" />
</template>
