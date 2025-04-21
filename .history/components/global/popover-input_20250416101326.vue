 
<script setup lang="ts">
 
import { motion } from 'motion-v'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  placeholder?: string
  variables?: { name: string; value: string }[]
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

const openPopover = ref(false)
const tempValue = ref(props.modelValue)
const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

watch(localValue, (val) => {
  emit('save', val)
})

watch(openPopover, (val) => {
  if (val) tempValue.value = localValue.value
})

function selectVariable(variable: { name: string; value: string }) {
  localValue.value = variable.value
  openPopover.value = false
}
</script>

<template>
  <div v-if="!props.disabled" class="relative w-full">
    <Input
      v-model="localValue"
      type="text"
      :placeholder="placeholder || 'Typing something...'"
      class="w-full pr-10"
    />

    <Popover v-model:open="openPopover">
      <PopoverTrigger as-child>
        <button class="absolute z-10 right-2 bottom-2.5 cursor-pointer flex items-center justify-center text-gray-500">
          <NuxtIcon name="solar:global-line-duotone" size="18" />
        </button>
      </PopoverTrigger>

      <PopoverContent class="w-64 p-2 space-y-1">
        <motion.div
          tag="div"
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -10 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
        >
          <div class="text-sm font-semibold text-gray-700 dark:text-white mb-2">Global Variables</div>
          <ul class="space-y-1 max-h-60 overflow-auto">
            <li
              v-for="variable in props.variables"
              :key="variable.name"
              class="cursor-pointer hover:bg-muted p-2 rounded transition-all"
              @click="selectVariable(variable)"
            >
              <div class="font-medium">{{ variable.name }}</div>
              <div class="text-xs text-gray-500 truncate">{{ variable.value }}</div>
            </li>
          </ul>
        </motion.div>
      </PopoverContent>
    </Popover>
  </div>

  <div v-else>
    <Input disabled class="w-full" type="text" :placeholder="placeholder || 'Receiving input'" />
  </div>
</template>
