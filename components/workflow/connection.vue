<script lang="ts" setup>

const props = defineProps<{
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  color: string
}>()


</script>

<template>
  <g>
    <path class="vue-flow__connection animated" fill="none" :stroke="color" :stroke-width="2.5" :d="`M${sourceX},${sourceY} C ${sourceX} ${targetY} ${sourceX} ${targetY} ${targetX},${targetY}`" />
  </g>
</template>
