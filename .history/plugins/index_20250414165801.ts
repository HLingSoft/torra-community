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

const options: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  transition: 'Vue-Toastification__fade',
  maxToasts: 1,
  timeout: 3000,
  filterBeforeCreate: (toast, toasts) => {
    if (toasts.filter(t => t.type === toast.type).length !== 0) {
      // Returning false discards the toast
      return false
    }
    // You can modify the toast if you want
    return toast
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  // nuxtApp.provide('tt', tt)
  // nuxtApp.provide('t', t)
  // nuxtApp.provide('locale', locale)

  nuxtApp.vueApp.use(Vue3Marquee, { name: 'Vue3Marquee' })
  nuxtApp.vueApp.use(Toast, options)

  nuxtApp.vueApp.component('vue-qrcode', VueQrcode)
  // nuxtApp.vueApp.component(DndContainer)
  // nuxtApp.vueApp.component(DndDraggable)
  nuxtApp.vueApp.use(autoAnimatePlugin)

  // if (process.client) {
  //   initFlowbite()
  // }

  // const colorMode = useColorMode()
  // console.log(colorMode.value)
  // watch(
  //   colorMode,
  //   () => {
  //     if (process.client) {
  //       if (document != null && typeof document === 'object') {
  //         if (colorMode.preference.includes('dark') || colorMode.preference.includes('night')) {
  //           document.documentElement.classList.add('dark')
  //         }
  //         else { document.documentElement.classList.remove('dark') }
  //       }
  //     }
  //   },
  //   { immediate: true },
  // )
  nuxtApp.hook('page:start', () => {
    /* your code goes here */
    console.log('重新显示界面了')
  })
  nuxtApp.hook('vue:error', (..._args) => {
    console.log('vue:error')
    // if (process.client) {
    //   console.log(..._args)
    // }
  })
})
