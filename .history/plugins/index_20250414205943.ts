import type { PluginOptions } from 'vue-toastification'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import Vue3Marquee from 'vue3-marquee'
import VueQrcode from 'vue-qrcode'
import Toast, { POSITION } from 'vue-toastification'
// import { Application, BlurFilter, Graphics } from 'pixi.js'
// import { isClient } from '@vueuse/core/index.cjs'
// console.log("当前环境变量", process.env.NODE_LOCAL)
// import { initFlowbite } from "flowbite"
// import autoAnimate, { getTransitionSizes } from "@formkit/auto-animate"

 
export default defineNuxtPlugin((nuxtApp) => {
  
  nuxtApp.vueApp.use(autoAnimatePlugin)
 
})
