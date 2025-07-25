import { defineStore } from 'pinia'
import User from '~~/models/User'
import UserWorkspace from '~~/models/UserWorkspace'
import { useLocalStorage } from '#imports' // Nuxt 的 useLocalStorage

export const useUserStore = defineStore('user', () => {
  const userId = useLocalStorage<string | null>('torra-user', null)
  const user = ref<User | null>(null)
  const showLogin = ref(false)
  const currentWorkspace = ref<UserWorkspace>()

  const init = async () => {
    const users = await new LC.Query(User).find()

    if (users.length === 0 || !userId.value) {
      logOut()
      showLogin.value = true
      return
    }
    showLogin.value = false
    if (users.length > 0 && userId.value) {
      user.value = users.find(u => u.objectId === userId.value) || null
    }
  }

  watch(user, (val) => {
    userId.value = val?.objectId ?? null
    showLogin.value = !val
  })

  const logOut = () => {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('torra-user')
    }
    showLogin.value = true
  }

  const getUser = () => {
    //通过当前的 userId 获取用户信息
    if (!userId.value) return null
    return new LC.Query(User).get(userId.value)

  }
  if (import.meta.client) init()

  return { user, showLogin, logOut, getUser, currentWorkspace }
})
