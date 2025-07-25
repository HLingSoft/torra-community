import { useLocalStorage } from '#imports'
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client) {
    const torraUser = useLocalStorage('torra-user', null)


    const isLoggedIn = !!torraUser.value

    const whiteList = ['index', 'login']
    const toName = to.name ? to.name.toString() : ''

    if (!isLoggedIn && !whiteList.includes(toName)) {
      const redirectPath = encodeURIComponent(to.fullPath)
      if (to.name !== 'login') { // ✅ 避免无限跳转
        if (import.meta.client) {
          window.location.replace(`/login?redirect=${redirectPath}`)
        }
        return abortNavigation ? abortNavigation() : false
      }
      // 这里必须 return false/abort，否则 SSR 下还会渲染目标页面
      return abortNavigation ? abortNavigation() : false
    }

  }
})
