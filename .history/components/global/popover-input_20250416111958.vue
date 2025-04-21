<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command'

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

// Popover 对齐宽度处理
const inputRef = ref<HTMLElement | null>(null)
const contentWidth = ref(0)

watch(openPopover, async (val) => {
  if (val && inputRef.value) {
    await nextTick()
    contentWidth.value = inputRef.value.offsetWidth
  }
})

function selectVariable(variable: { name: string; value: string }) {
  localValue.value = variable.value
  openPopover.value = false
}
watch(openPopover, (val) => {
   console.log('Popover open state:', val)
})
</script>

<template>
  <div v-if="!props.disabled" class=" w-full">
   

    <Popover class="w-full"  >
        <PopoverTrigger class="w-full relative">
            <div ref="inputRef">
      <Input
        v-model="localValue"
        type="text"
        :placeholder="placeholder || 'Typing something...'"
        class="w-full pr-10"
      />
    </div>
  
    <!-- 图标触发 -->
    <div
      
      class="absolute z-10 right-2 bottom-2.5 cursor-pointer flex items-center justify-center  "
    >
      <NuxtIcon name="solar:global-line-duotone" size="18" />
    </div>
            </PopoverTrigger>
        
  <PopoverContent
 
  
  class="p-0 dark text-xs "
>
        <Command>
          <CommandInput placeholder="Search Global variables..." />
          <CommandList>
            <CommandEmpty>No variables found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
            <CommandItem
              v-for="variable in props.variables"
              :key="variable.name"
              :value="variable.value"
              @select="selectVariable(variable)"
            >
              <div class="flex flex-col">
                <span class="font-medium">{{ variable.name }}</span>
                <span class="text-xs text-muted-foreground truncate">{{ variable.value }}</span>
              </div>
            </CommandItem>
          </CommandGroup>
        
          </CommandList>
          <CommandSeparator />
          <CommandGroup heading="Actions">
          <CommandItem value="profile">
           Add New Variable
          </CommandItem>
          
        </CommandGroup>
          
          
        </Command>
      </PopoverContent>
    </Popover>
  </div>

  <div v-else>
    <Input disabled class="w-full" type="text" :placeholder="placeholder || 'Receiving input'" />
  </div>
</template>
