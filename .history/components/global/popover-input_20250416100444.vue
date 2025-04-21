<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { motion } from 'motion-v'
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: string
  variables?: { name: string; value: string }[]
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isOpen = ref(false)

function selectVariable(variable) {
  value.value = variable.value
  isOpen.value = false
}
</script>

<template>
  <div class="relative w-full">
    <Input v-model="value" placeholder="Typing something..." class="w-full pr-8" />

    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <button class="absolute right-2 bottom-2.5 z-10 text-gray-500">
          <NuxtIcon name="solar:global-line-duotone" size="18" />
        </button>
      </PopoverTrigger>

      <PopoverContent class="w-64 p-2">
        <Motion
          tag="div"
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -10 }"
          transition="{ type: 'spring', stiffness: 300, damping: 20 }"
        >
          <div class="text-sm font-semibold text-gray-700 mb-2">Global Variables</div>
          <ul>
            <li
              v-for="variable in variables"
              :key="variable.name"
              class="cursor-pointer hover:bg-gray-100 p-2 rounded"
              @click="selectVariable(variable)"
            >
              <div class="font-medium">{{ variable.name }}</div>
              <div class="text-xs text-gray-500 truncate">{{ variable.value }}</div>
            </li>
          </ul>
        </Motion>
      </PopoverContent>
    </Popover>
  </div>
</template>
