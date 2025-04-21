<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/vue.css' 
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

onMounted(()=>{
  toast('新建工作流成功')
})

</script>
<template>
  <!-- <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div> -->
  <!-- 全局 shadcn toast 支持 -->
  <div>
    <ClientOnly>
    <ConfirmDialog />
  </ClientOnly>
    <ClientOnly>
      <Toaster position="top-right"/>
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

<!-- <style>
@font-face{
  font-family: 'HLFont-Heavy';

  font-weight: normal;
  font-style: normal;
  font-display: swap;
  src: url('https://file.web.hlingsoft.com/1Dw6BTcV5ma0ysfF9VQJHrBcwOMqXr3x/AlibabaPuHuiTi-3-105-Heavy.eot'); /* IE9*/
  src: url('https://file.web.hlingsoft.com/1Dw6BTcV5ma0ysfF9VQJHrBcwOMqXr3x/AlibabaPuHuiTi-3-105-Heavy.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('https://file.web.hlingsoft.com/YhSxfHOdRqaapJUemPjMJI2FPTmaCxQF/AlibabaPuHuiTi-3-105-Heavy.woff2') format('woff2'),
    url('https://file.web.hlingsoft.com/M8FaRBRCbhrhO3yHNVrpAb7byITEipiN/AlibabaPuHuiTi-3-105-Heavy.woff') format('woff'), /* chrome、firefox */
    url('https://file.web.hlingsoft.com/jf2K9Si3qqUgqVemjMx62pumXNC15C76/AlibabaPuHuiTi-3-105-Heavy.ttf') format('truetype'), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
    url('https://file.web.hlingsoft.com/Eb36GjzTq8cJN0Uh875c7zSC9N1ElbAK/AlibabaPuHuiTi-3-105-Heavy.otf') format('opentype'); /* iOS 4.1- */

}

@font-face{
  font-family: 'HLFont-Normal';
  font-weight: normal;
  font-style: normal;
  font-display: swap;
  src:  url('https://file.webkankan.com/YmCKEcRy8q2J2ARu3RcVUDaemu7IcMjx/SourceHanSerifCN-Medium.otf') format('opentype');

}

body{
 font-family:  -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
  /* font-family: 'HLFont-Normal', -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", Icons16, sans-serif; */
}
</style> -->
