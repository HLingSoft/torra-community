<script lang="ts" setup>
// import { useVueFlow } from '@vue-flow/core'

defineProps({
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
})

// const { findNode } = useVueFlow()
</script>

<template>
  <g>
    <path
      class="vue-flow__connection animated"
      fill="none"
      :stroke="color"
      :stroke-width="2.5"
      :d="`M${sourceX},${sourceY} C ${sourceX} ${targetY} ${sourceX} ${targetY} ${targetX},${targetY}`"
    />
  </g>
</template>
