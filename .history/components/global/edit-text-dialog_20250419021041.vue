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
</script>

<template>
  <div v-bind="$attrs">
  <div  v-if="!props.disabled" class="relative w-full">
    <Input v-model="localValue" type="text" :placeholder="placeholder || 'Typing something'" class="w-full pr-10 " />
    <NuxtIcon
      name="solar:full-screen-broken"
      size="18"

      class="absolute z-10 right-2 bottom-2.5 cursor-pointer flex justify-center items-center"
      @click.stop="open = true"
    />
  </div>
  <div v-else class="relative">
    <Input disabled class="w-full" type="text" placeholder="Receiving input" />
    <NuxtIcon name="lets-icons:lock-duotone" size="20" class="absolute z-10 right-2 bottom-2.5 " />
  </div>
  <Dialog :open="open" @update:open="open = $event">
    <DialogContent class="dark text-white w-full text-sm !max-w-7xl ">
      <DialogHeader>
        <DialogTitle>Edit text content</DialogTitle>
        <DialogDescription>Edit detailed content in textarea.</DialogDescription>
      </DialogHeader>

      <Textarea
        v-model="tempValue"
        class="w-full h-[60vh] resize-none"

        :placeholder="placeholder || 'Typing...'"
      />

      <DialogFooter class="w-full flex flex-row items-center justify-between">
        <Button @click="save">
          Finish Editing
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
</template>
