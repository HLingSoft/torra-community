<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <!-- rounded-xl   text-card-foreground hover:shadow-lg transition-shadow duration-300 hover:shadow-[rgba(219,219,219,0.66)]  -->
  <div
    data-slot="card"
    :class="
      cn(
        ' text-card-foreground flex flex-col gap-6 rounded-xl   py-6 shadow-sm hover:shadow-lg transition-shadow duration-300 hover:shadow-[rgba(219,219,219,0.66)]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
