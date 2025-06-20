<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from 'vue-sonner'

const nuxtApp = useNuxtApp()

nuxtApp.hook('page:finish', () => {
  window.scrollTo({ top: 0 })
})


const showLoginTeleport = ref(false)

watch(
  nuxtApp.payload.data,
  () => {

    if (nuxtApp.payload.data.needLogin && nuxtApp.payload.data.needLogin.flag) {
      showLoginTeleport.value = true

    }
    else { showLoginTeleport.value = false }
  },
  {
    immediate: true,
    deep: true,
  },
)



</script>
<template>

  <!-- 全局 shadcn toast 支持 -->
  <div>
    <ClientOnly>
      <ConfirmDialog />
    </ClientOnly>
    <ClientOnly>
      <Toaster position="top-right" theme="dark" />
    </ClientOnly>
    <ClientOnly>
      <Transition name="slide-fade" mode="out-in">
        <Login v-if="showLoginTeleport" @close="showLoginTeleport = false" />
      </Transition>
    </ClientOnly>
    <ClientOnly>

      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </ClientOnly>
  </div>

</template>
