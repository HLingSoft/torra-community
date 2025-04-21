import User, { EnumUser } from '~/models/User'
 
import { defineStore } from 'pinia'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<User | null>(null)
    const showLoginComponent = ref(false)
    const needShowLoginButton = ref(false)
    const leancloudUser = ref(LC.User.current())
    const setUser = (gwUser: User) => {
      user.value = gwUser
      showLoginComponent.value = false
      needShowLoginButton.value = false
    }
    const hasLeancloudUser = computed(() => {
      return LC.User.current() !== null
    })
    const isRequesting = ref(false)
    const isLoggedIn = computed(() => {
      return leancloudUser.value !== null || user.value !== null
    })
    const getUser = async () => {
      if (user && user.value) {
        // return (await new LC.Query(User).equalTo(EnumUser.USER, LC.User.current()).first()) as User
        return user.value as User
      }
      else if (isLoggedIn.value) {
        return (await new LC.Query(User).equalTo(EnumUser.USER, LC.User.current()).first()) as User
      }
      else {
        return null
      }
    }

    const init = async () => {
      console.log('useUserStore 初始化')
      isRequesting.value = true
      if (leancloudUser.value && !user.value) {
        user.value = await getUser()
        showLoginComponent.value = false
        needShowLoginButton.value = false
      }

      // await promiseTimeout(1000)
      isRequesting.value = false
    }

    // await getUser()
    // const isLoggedIn = ref(LC.User.current() !== null)

    const logOut = async () => {
      await LC.User.logOut()
      needShowLoginButton.value = true
      user.value = null
    }
    init()

    return { user, setUser, isLoggedIn, getUser, init, hasLeancloudUser, isRequesting, logOut, showLoginComponent, needShowLoginButton }
  } 
)
