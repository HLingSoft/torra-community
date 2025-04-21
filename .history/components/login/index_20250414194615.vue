<script setup lang="ts">
import { promiseTimeout } from '@vueuse/core'

// import Avatar from '@models/SystemAvatar'
import User, { EnumUser } from '@models/User'
// import Platform_Token, { EnumPlatform_Token } from '@models/Platform_Token'

const emit = defineEmits(['close'])
function close() {
  document.body.style.overflow = 'auto'
  emit('close')
}

 

const loginQRCode = ref<string>()
const loginType = ref<number>(0)
const isScanSuccess = ref<boolean>(false)
const openid = ref<string>()
const allAvatar = ref()
async function checkUser() {
  const user = (await new LC.Query(User).include(EnumUser.USER).equalTo(EnumUser.MP_OPENID, openid.value).equalTo(EnumUser.VALIDATED, true).first()) as User

  if (user) {
    // 老用户
    const userSessionToken = await LC.Cloud.run('getUserSessionToken', {
      userId: user.user.get('objectId'),
    })
    if (user.phone) {
      await LC.User.become(userSessionToken)
       

      await user.save()
      await user.fetch()
      useUserStore().setUser(user)
      // await promiseTimeout(2000)
      // await nextTick()
      close()
      window.location.reload()
    }
    else {
      loginType.value = 1
    }
  }
  else {
    loginType.value = 1
  }
  // 返回首页
}

const maxScanTimeout = 60
const scanTimeoutNumber = ref(maxScanTimeout)
async function requestQRCode(): Promise<void> {
  loginQRCode.value = ''
  await promiseTimeout(1000)
  const qrResult = await LC.Cloud.run('getLoginQRCode')
  console.log(qrResult)
  loginQRCode.value = qrResult.url

  scanTimeoutNumber.value = maxScanTimeout
  const { pause } = useIntervalFn(async () => {
    // console.log(scanTimeoutNumber.value)
    if (scanTimeoutNumber.value === 0) {
      pause()
      return
    }

    if (scanTimeoutNumber.value % 10 === 0) {
      scanTimeoutNumber.value--
      // 当 scanTimeoutNumber.value 除以 10 的余数为 0 时，执行这里的代码
      // console.log("发起请求")
      const isScanValue = await LC.Cloud.run('checkLoginQRCodeIsScan', {
        ticket: qrResult.ticket,
      })
      console.log(isScanValue)
      isScanSuccess.value = isScanValue
      if (isScanSuccess.value) {
        pause()
        openid.value = await LC.Cloud.run('getOpenIdWhenScanLoginQRCodeSuccess', {
          useMasterKey: true,
          ticket: qrResult.ticket,
        })
        if (openid.value && openid.value.length > 0) {
          await checkUser()
        }
      }
    }
    else {
      scanTimeoutNumber.value--
    }
  }, 1000)
}
 

const phoneNumber = ref('')
const canRequestLoginSmsCode = ref(false)
const requestLoginSmsCodeCountdown = ref(60)
const isRequestLoginSmsCode = ref(false)
watch(
  () => phoneNumber.value,
  () => {
    if (!_.isEmpty(phoneNumber.value) && /^1[3-9]\d{9}$/.test(phoneNumber.value)) {
      canRequestLoginSmsCode.value = true
    }
    else { canRequestLoginSmsCode.value = false }
  },
)
const smsCode = ref('')
const canLogin = ref(false)
watch(
  () => smsCode.value,
  () => {
    if (smsCode.value.length === 6 && canRequestLoginSmsCode.value) {
      canLogin.value = true
    }
    else { canLogin.value = false }
  },
)

async function requestLoginSmsCode() {
  if (_.isEmpty(phoneNumber.value)) {
    useHLToast('请输入手机号码')

    return
  }
  if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) {
    useHLToast('手机号码格式错误')

    return
  }
  isRequestLoginSmsCode.value = true
  requestLoginSmsCodeCountdown.value = 60
  const { pause } = useIntervalFn(() => {
    requestLoginSmsCodeCountdown.value--
    if (requestLoginSmsCodeCountdown.value <= 0) {
      pause()

      requestLoginSmsCodeCountdown.value = 0
      isRequestLoginSmsCode.value = false
    }
  }, 1000)

  try {
    await LC.Cloud.requestSmsCode(phoneNumber.value)
  }
  catch (e) {
    console.log(e)

    isRequestLoginSmsCode.value = false

    useHLToast('短信发送过快，请稍后再试。')
  }
}
 
const isDoLogin = ref(false)
async function doLogin() {
  try {
    isDoLogin.value = true
    console.log(phoneNumber.value, smsCode.value)
    const lcUser = await LC.User.signUpOrlogInWithMobilePhone(phoneNumber.value, smsCode.value)
    requestLoginSmsCodeCountdown.value = 0
    const user = new User()
    user.user = lcUser
    user.mp_openId = openid.value
    user.validated = true
    user.isSubscribe = true
    user.name = phoneNumber.value
   
    user.phone = phoneNumber.value
    user.avatar = allAvatar.value[0]
    await user.save()
    await user.fetch()
    useHLToast('登录成功', ToastPosition.TOP_CENTER)
    useUserStore().setUser(user)
    close()
    window.location.reload()
  }
  catch (e: unknown) {
    console.log(e)
    useHLToast('注册/登录失败，请稍后再试。', ToastPosition.TOP_CENTER)
  }
  finally {
    isDoLogin.value = false
  }
}
onBeforeUnmount(() => {
  // clearInterval(loginCheckInterval)
  scanTimeoutNumber.value = 0
  requestLoginSmsCodeCountdown.value = 0
})
</script>

<template>
  <div class="flex fixed z-[999] inset-0 bg-white">
    <button
      class="absolute top-0 right-0 z-30 flex items-center justify-center px-3 py-2 mt-3 mr-3 space-x-1 text-xs font-medium uppercase rounded-md text-neutral-600 hover:bg-neutral-100"
      @click="close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span>关闭</span>
    </button>
    <div class="relative top-0 bottom-0 right-0 flex-shrink-0 hidden 2xl:w-60 overflow-hidden bg-cover 2xl:block">
      <div class="opacity-0 dark:opacity-70 absolute inset-0 z-20 w-full h-full bg-gradient-to-t from-black" />

      <img src="https://file.newoakbay.com/R2jfCWFXbScpBvqEYmiUiLbOiEhoHUtx/login_bg.jpg" class="z-10 object-cover w-full h-full">
    </div>
    <div class="relative flex flex-wrap items-center w-full h-full px-8">
      <div class="relative w-full max-w-sm mx-auto lg:mb-0">
        <nav id="nav" class="dy-navbar fixed bottom-0 w-full">
          <div class="flex flex-none gap-2">
            <a class="flex cursor-pointer flex-row justify-center items-center text-base">
              <img src="@/assets/logo.png" class="w-5">
              <p class="ml-3 text-sm flex flex-row items-center font-semibold">
                <span class="">AskPro</span>
                <span class="text-opacity-50 ml-5 text-xs lg:text-sm">一站式 RAG 平台</span>
              </p>
            </a>
          </div>
        </nav>
        <div class="bg-white text-black overflow-hidden">
          <div class="relative flex flex-wrap w-full">
            <div class="w-[500px] h-[500px] relative flex flex-row items-start overflow-hidden">
              <section v-if="loginType === 0" class="flex flex-col justify-center items-center">
                <div class="text-lg flex dy-card-title flex-row mb-6 items-center">
                  <NuxtIcon name="uiw:weixin" class="mr-2" size="24" />微信安全登录<span v-if="loginQRCode && scanTimeoutNumber !== 0 && !isScanSuccess" class="dy-countdown"><span :style="{ '--value': scanTimeoutNumber }" /></span>
                </div>
                <div
                  :class="loginQRCode && scanTimeoutNumber !== 0 ? ' cursor-not-allowed' : ' cursor-pointer '"
                  class="bg-gray-100 relative rounded-lg p-1 w-[320px] aspect-square flex items-center justify-center"
                >
                  <vue-qrcode
                    v-if="loginQRCode && scanTimeoutNumber !== 0"
                    class="animate-fadeIn"
                    :value="loginQRCode"
                    :quality="1"
                    :color="{ dark: '#000000ff', light: '#ffffffff' }"
                    type="image/webp"
                    :width="270"
                  />
                  <div v-if="!loginQRCode || loginQRCode.length === 0" class="dy-loading dy-loading-dots dy-loading-sm" />
                  <div
                    v-if="loginQRCode && isScanSuccess"
                    class="bg-black absolute z-50 bg-opacity-60 rounded-lg text-white w-[250px] aspect-square animate-fadeIn flex flex-col items-center justify-center"
                  >
                    <NuxtIcon name="icon-park:check" size="24" class="!text-white" />
                    <p>扫码成功</p>
                  </div>

                  <div v-if="scanTimeoutNumber === 0 && loginQRCode && loginQRCode.length > 0" class="bg-gray-100 animate-wobble w-full h-full flex flex-col items-center justify-center" @click="requestQRCode">
                    <NuxtIcon name="icon-park:refresh-one" size="24" />
                    <p class="mt-5 font-medium">
                      二维码已失效，点击重置。
                    </p>
                  </div>
                </div>
                <div class="mt-5 text-sm  opacity-80 flex items-center bg-base-200 dark:bg-gray-100 dark:text-black rounded-lg px-4 py-1.5">
                  <!-- <NuxtIcon name="icon-park-outline:weixin-scan" class="mx-2" /> -->
                  <lord-icon
                    src="https://file.web.hlingsoft.com/FMG6BzmFGKIUxBRzxjBnjgTxRjVdK7UF/system-regular-69-document-scan.json"

                    stroke="light"
                    trigger="loop"

                    style="width:20px;height:20px"
                  />
                  <p class="ml-2">
                    使用微信扫一扫登录
                  </p>
                </div>
                <div class="mt-5 text-sm  opacity-80 flex items-center  px-4 py-1.5">
                  <p class="">
                    关注公众号即可登录
                  </p>
                </div>
              </section>

              <section v-if="loginType === 1" class="flex flex-col justify-center text-sm items-center animate-fadeInRight animate-duration-75">
                <div class="w-96 relative flex list-none justify-center rounded-lg  px-10 items-center py-2.5">
                  <NuxtIcon name="bi:phone" size="16" />
                  <p class="block leading-relaxed mx-2 text-inherit antialiased">
                    使用手机号码免密登录
                  </p>
                </div>

                <div class="relative rounded-lg w-full my-20 flex flex-col items-center justify-center">
                  <InputStandard id="phone" v-model="phoneNumber" name="phone" placeholder="手机号码" class="h-11 w-full min-w-[200px]" />

                  <div class="flex flex-row mt-10 w-full items-center">
                    <InputStandard id="smsCode" v-model="smsCode" placeholder="验证码" name="smsCode" class="h-11 w-full min-w-[100px]" />

                    <button :disabled="!canRequestLoginSmsCode" class="dy-btn dy-btn-md ml-10 w-28" @click="requestLoginSmsCode">
                      <span v-if="isRequestLoginSmsCode" class="dy-countdown"><span :style="{ '--value': requestLoginSmsCodeCountdown }" /></span>
                      <span v-else>获取验证码</span>
                    </button>
                  </div>
                </div>
                <div class="w-full flex flex-row items-center justify-between gap-x-10">
                  <!-- <div class="dy-btn dy-btn-ghost dy-btn-md" @click="doLoginDirect">
                    暂不绑定
                  </div> -->
                  <button :disabled="!canLogin || isDoLogin" class="dy-btn dy-btn-md dy-btn-primary w-full" @click="doLogin">
                    {{ isDoLogin ? '正在登录' : '登录' }}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>
