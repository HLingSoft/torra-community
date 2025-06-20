import { defineStore } from 'pinia'
import User from '~/models/User'
import UserWorkspace from '~/models/UserWorkspace'
export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<User | null>(null)
    const currentWorkspace = ref<UserWorkspace | null>(null)
    const showLoginComponent = ref(false)



    const init = async () => {
      const users = await User.all()
      const localStorageUser = localStorage.getItem('torra-user')
      if (users.length === 0 && !localStorageUser) {
        showLoginComponent.value = true
        return
      }
      console.log('users', users, localStorageUser)
      showLoginComponent.value = false
      if (users.length > 0 && localStorageUser) {
        user.value = users.find(u => u.objectId === localStorageUser) || null
      }
      console.log('user', user.value)
      // localStorage.getItem('torra-user') && (user.value = await User.find(localStorage.getItem('torra-user')!))
    }

    watch(user, () => {
      if (user.value === null) {
        showLoginComponent.value = true
        localStorage.removeItem('torra-user')
      } else {
        showLoginComponent.value = false
        localStorage.setItem('torra-user', user.value.objectId)
      }

    })

    const logOut = async () => {
      localStorage.removeItem('torra-user')
      user.value = null
      showLoginComponent.value = true
    }
    init()

    return { user, logOut, showLoginComponent, currentWorkspace }
  }
)
