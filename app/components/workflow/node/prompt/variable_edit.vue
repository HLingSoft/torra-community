<!-- components/EditTextDialog.vue -->
<script setup lang="ts">

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  placeholder?: string
}>()

const emits = defineEmits<{

  (e: 'save', value: string): void
}>()
const open = ref(false)
const tempValue = ref(props.modelValue)
const localValue = ref(props.modelValue)
watch(() => props.modelValue, (val) => {
  localValue.value = val
})
watch(open, (val) => {
  if (val) {
    tempValue.value = localValue.value
  }
})
const save = () => {
  emits('save', tempValue.value)
  open.value = false
}
watch(localValue, (val) => {
  emits('save', val)
})



const inputVariables = computed((): { name: string }[] => {
  // 移除 {{ ... }} 双大括号包裹的部分
  let text = tempValue.value || ''
  text = text.replace(/{{[^{}]*}}/g, '')

  // 提取单层 {} 变量
  const regex = /{([^{}]+)}/g
  const set = new Set<string>()
  const result: { name: string }[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const name = match[1]!.replace(/^{|}$/g, '').trim()
    if (!set.has(name)) {
      set.add(name)
      result.push({ name })
    }
  }

  return result
})

</script>

<template>
  <div v-bind="$attrs" class="relative">

    <div v-if="!props.disabled" class="relative w-full">
      <Input v-model="localValue" type="text" :placeholder="placeholder || 'Typing something'" class="w-full pr-10 " />
      <NuxtIcon name="solar:full-screen-broken" size="18" class="absolute z-10 right-2 bottom-2.5 cursor-pointer flex justify-center items-center" @click.stop="open = true" />
    </div>
    <div v-else class="relative">
      <Input disabled class="w-full" type="text" placeholder="Receiving input" />
      <NuxtIcon name="lets-icons:lock-duotone" size="20" class="absolute z-10 right-2 bottom-2.5 " />
    </div>
    <Dialog :open="open" @update:open="open = $event">
      <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="  w-full text-sm !max-w-7xl ">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogDescription>Create your prompt. Prompts can help guide the behavior of a Language Model. Use curly brackets {} to introduce inputVariables.</DialogDescription>
        </DialogHeader>

        <Textarea v-model="tempValue" class="w-full h-[60vh] resize-none" placeholder="请输入提示词模板" />

        <DialogFooter class="w-full flex flex-row items-center justify-between">
          <div class="w-full flex flex-col">
            <DialogTitle class="text-base">
              {} Prompt Variables:<span v-for="variable in inputVariables" :key="variable.name" class=" text-primary  rounded-full px-2 py-1 mx-1  text-xs">{{ variable.name }}</span>
            </DialogTitle>
            <DialogDescription>
              Prompt inputVariables can be created with any chosen name inside curly brackets, e.g. {variable_name}
            </DialogDescription>
          </div>
          <div class="flex flex-row space-x-2  ">
            <Button @click="save">
              Check&Save
            </Button>

          </div>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  </div>
</template>
