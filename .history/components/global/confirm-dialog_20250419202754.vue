<script setup lang="ts">
 

const isOpen = ref(false)
const options = ref({
  title: '',
  description: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  resolve: (val: boolean) => {},
})

const confirm = (opts: Partial<typeof options.value>) => {
  return new Promise<boolean>((resolve) => {
    options.value = {
      ...options.value,
      ...opts,
      resolve,
    }
    isOpen.value = true
  })
}

const handleConfirm = () => {
  options.value.resolve(true)
  isOpen.value = false
}

const handleCancel = () => {
  options.value.resolve(false)
  isOpen.value = false
}

// ⬇️ provide 给 composable 使用
defineExpose({ confirm })
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[425px] dark">
      <DialogHeader>
        <DialogTitle>{{ options.title }}</DialogTitle>
        <DialogDescription>{{ options.description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex gap-2 justify-end">
        <Button v-if="options.showCancel" variant="outline" @click="handleCancel">
          {{ options.cancelText }}
        </Button>
        <Button variant="destructive" @click="handleConfirm">
          {{ options.confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
