<script setup lang="ts">
 
 

const handleConfirm = () => {
  confirmState.resolve(true)
  confirmState.show = false
}
const handleCancel = () => {
  confirmState.resolve(false)
  confirmState.show = false
}
</script>

<template>
  <Dialog  v-model:open="confirmState.show">
    <DialogContent class="w-full max-w-sm dark">
      <DialogHeader class="text-white">
        <DialogTitle class="text-sm">{{ confirmState.title }}</DialogTitle>
        <DialogDescription class="mt-1">{{ confirmState.description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter class="mt-5" >
        <Button class="text-white" variant="outline" v-if="confirmState.showCancel" @click="handleCancel">
          {{ confirmState.cancelText }}
        </Button>
        <Button variant="destructive" @click="handleConfirm">
          {{ confirmState.confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
