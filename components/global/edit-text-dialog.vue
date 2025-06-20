<script setup lang="ts">
import type { InputPortVariable } from '~/types/workflow'
import { Handle, Position } from '@vue-flow/core'

const { edges } = storeToRefs(useWorkflowStore())


// defineProps<{
//   placeholder?: string
//   showInput?: boolean  // 新增属性
// }>()
withDefaults(defineProps<{
  placeholder?: string
  showInput?: boolean
  handleBg?: string  // 新增
}>(), {
  showInput: true,
  placeholder: 'Typing something'
})
const inputVariableRef = defineModel<InputPortVariable>('inputVariable')

const open = ref(false)
watch(open, (val) => {
  if (val) {
    tempValue.value = inputVariableRef.value?.value || ''
  }
})
const targetHandleUUID = ref()
onMounted(() => {
  if (inputVariableRef.value) {
    if (!inputVariableRef.value.id) {
      inputVariableRef.value.id = nanoLowercaseAlphanumericId(10)
    }
    targetHandleUUID.value = inputVariableRef.value.id
  }
})
watch(edges, () => {
  if (inputVariableRef.value && targetHandleUUID.value) {

    //看看是否有连接
    inputVariableRef.value.connected = edges.value.some(edge => edge.targetHandle === targetHandleUUID.value)
  }
}, { immediate: true })
const tempValue = ref(inputVariableRef.value?.value || '')



const save = () => {

  if (inputVariableRef.value) {
    open.value = false
    inputVariableRef.value.value = tempValue.value
  }

}
onUnmounted(() => {
  if (inputVariableRef.value && targetHandleUUID.value) {
    const index = edges.value.findIndex(edge => edge.targetHandle === targetHandleUUID.value)
    if (index !== -1) {
      edges.value.splice(index, 1)
    }
  }
})

</script>
<template>
  <div v-bind="$attrs" class="relative " v-if="inputVariableRef">

    <Handle type="target" :id="targetHandleUUID" :connectable-start="false" :position="Position.Left" :style="{ top: showInput ? '20px' : '-30px', left: '-25px', ...(handleBg ? { '--handle-bg': handleBg } : {}) }" />

    <div v-if="showInput">
      <div v-if="!inputVariableRef.connected" class="relative w-full h-10">
        <Input v-model="inputVariableRef.value" type="text" :placeholder="placeholder || 'Typing something'" class="w-full pr-10  " />
        <NuxtIcon name="solar:full-screen-broken" size="18" class="absolute  z-10 right-2 bottom-3 cursor-pointer flex justify-center items-center" @click.stop="open = true" />
      </div>
      <div v-else class="relative h-10">
        <Input disabled class="w-full " type="text" placeholder="Receiving input" />
        <NuxtIcon name="lets-icons:lock-duotone" size="20" class="absolute z-10 right-2 bottom-3" />
      </div>
      <Dialog :open="open" @update:open="open = $event">
        <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="dark text-white w-full text-sm !max-w-7xl">
          <DialogHeader>
            <DialogTitle>Edit text content</DialogTitle>
            <DialogDescription>Edit detailed content in textarea.</DialogDescription>
          </DialogHeader>
          <Textarea v-model="tempValue" class="w-full h-[60vh] resize-none" :placeholder="placeholder || 'Typing...'" />
          <DialogFooter class="w-full flex flex-row items-center justify-between">
            <Button @click="save">Finish Editing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  </div>
</template>
