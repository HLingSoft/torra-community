export default defineNuxtRouteMiddleware(async (to) => {
  // 确保此逻辑仅在客户端执行
  if (process.client) {
    const nuxt = useNuxtApp()
    await nextTick()
    // await new Promise(resolve => setTimeout(resolve, 100)) // 稍微延迟以等待状态恢复，可能需要调整延迟时长
    const isLoggedIn = LC.User.current() !== null

    console.log('to', to.name)
    console.log('isLoggedIn', isLoggedIn)

    const whiteList = ['index', '', 'vip', 'doc', 'blog', 'conversation-share', 'contact', 'character-invite', 'test', 'test4', 'character-slug']

    // 如果用户已登录且试图访问登录页面，重定向到主页或其他页面
    // if (isLoggedIn && to.path === "/login") {
    //   return navigateTo("/")
    // }

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
