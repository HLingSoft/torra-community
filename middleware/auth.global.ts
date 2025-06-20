export default defineNuxtRouteMiddleware(async (to) => {
  // 确保此逻辑仅在客户端执行
  if (import.meta.client) {
    const nuxt = useNuxtApp()
    await nextTick()

    const isLoggedIn = localStorage.getItem('torra-user') ? true : false



    const whiteList = ['index']


    const toName = to.name ? to.name.toString() : ''


    if (!isLoggedIn && !whiteList.includes(toName)) {
      nuxt.payload.data.needLogin = {
        flag: true,
        times: new Date().getTime(),
      }
      return abortNavigation()
    }
  }
})
