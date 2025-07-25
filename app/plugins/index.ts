
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

import { DotLottieVue } from "@lottiefiles/dotlottie-vue";
import VueQrcode from 'vue-qrcode'

export default defineNuxtPlugin((nuxtApp) => {

  nuxtApp.vueApp.use(autoAnimatePlugin)
  nuxtApp.vueApp.component('dotlottie-vue', DotLottieVue)
  nuxtApp.vueApp.component('vue-qrcode', VueQrcode)

})
