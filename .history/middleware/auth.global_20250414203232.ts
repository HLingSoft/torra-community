export default defineNuxtRouteMiddleware(async (to) => {
  // 确保此逻辑仅在客户端执行
  if (import.meta.client) {
    const nuxt = useNuxtApp()
    await nextTick()
    // await new Promise(resolve => setTimeout(resolve, 100)) // 稍微延迟以等待状态恢复，可能需要调整延迟时长
    const isLoggedIn = LC.User.current() !== null

    console.log('to', to.name)
    console.log('isLoggedIn', isLoggedIn)

    const whiteList = ['index']
 
    // 检查 to.name 是否存在
    const toName = to.name ? to.name.toString() : ''
    console.log('toName', toName)

    // 如果用户未登录且目标页面不在白名单内，重定向到登录页面
    if (!isLoggedIn && !whiteList.includes(toName)) {
      nuxt.payload.data.needLogin = {
        flag: true,
        times: new Date().getTime(),
      }
      return abortNavigation()
    }
  }
})
