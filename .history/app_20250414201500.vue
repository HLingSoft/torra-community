<script setup lang="ts">
 
const nuxtApp = useNuxtApp()
const { user } = storeToRefs(useUserStore())
nuxtApp.hook('page:finish', () => {
  window.scrollTo({ top: 0 })
})
 

const showLoginTeleport = ref(false)
 
watch(
  nuxtApp.payload.data,
  () => {
    console.log('nuxtApp.payload.data', nuxtApp.payload.data)
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
function closeLogin() {
  showLoginTeleport.value = false
  if (!user.value) {
    console.log(nuxtApp.payload.data)
  }
}
</script>
<template>
  <!-- <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div> -->
  <!-- 全局 shadcn toast 支持 -->
  <div>
    <ClientOnly>
      <Toaster />
    </ClientOnly>
    <ClientOnly>
      <Transition name="slide-fade" mode="out-in">
        <Login v-if="showLoginTeleport" @close="closeLogin" />
      </Transition>
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>

</template>
