<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from 'vue-sonner'

// const colorMode = useColorMode()
// :class="{ dark: colorMode.value === 'dark' }"
</script>
<template>

  <!-- 全局 shadcn toast 支持 -->
  <div>
    <ClientOnly>
      <ConfirmDialog />
    </ClientOnly>
    <ClientOnly>
      <Toaster position="top-right" />
    </ClientOnly>


    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>

</template>
