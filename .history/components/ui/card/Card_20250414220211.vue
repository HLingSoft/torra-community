<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'rounded-xl   text-card-foreground hover:shadow-lg transition-shadow duration-300 hover:shadow-[rgba(219,219,219,0.66)] ',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
