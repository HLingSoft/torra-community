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
  <Dialog v-model:open="confirmState.show">
    <DialogContent class="w-full max-w-sm dark">
      <DialogHeader>
        <DialogTitle>{{ confirmState.title }}</DialogTitle>
        <DialogDescription>{{ confirmState.description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" v-if="confirmState.showCancel" @click="handleCancel">
          {{ confirmState.cancelText }}
        </Button>
        <Button variant="destructive" @click="handleConfirm">
          {{ confirmState.confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
