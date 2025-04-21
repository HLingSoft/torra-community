<script setup lang="ts">

import User, { EnumUser } from '@models/User'

const emit = defineEmits(['close'])
function close() {
    document.body.style.overflow = 'auto'
    emit('close')
}
const route = useRoute()
enum SignType {
    signIn = 'signIn',
    signUp = 'signUp',
}
const signInOrSignUp = ref(SignType.signIn)
const smsCode = ref([])
const handleComplete = async (value: string[]) => {
    // console.log(value)
    if (value.length === 6 && signInOrSignUp.value === SignType.signIn) {
        await signIn()
        // smsCode.value = value
    }
}
// const { user } = storeToRefs(useUserStore())
const { logOut, setUser } = useUserStore()
onBeforeMount(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const scrollableElements = document.querySelectorAll('[data-scrollable]')
    scrollableElements.forEach((el: unknown) => ((el as HTMLElement).style.overflow = 'hidden'))
})
onBeforeUnmount(() => {
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    const scrollableElements = document.querySelectorAll('[data-scrollable]')
    scrollableElements.forEach((el: unknown) => ((el as HTMLElement).style.overflow = 'auto'))
})
const currentLoginUser = ref<User | null>(null)

onMounted(async () => {
    await logOut()
    currentLoginUser.value = new User()
    currentLoginUser.value.avatar = ''
    currentLoginUser.value.gender = 1

})
const uploadAvatarUrl = ref('')
const { onChange: avatarFileOnChange } = useFileDialog({
    accept: 'image/*',
    multiple: false,
})
avatarFileOnChange(async (files) => {
    /** do something with files */
    if (files && files.length > 0) {
        const file = files[0]
        const avFile = new LC.File(file.name, file)
        await avFile.save()
        console.log(avFile.url())
        if (currentLoginUser.value) {
            currentLoginUser.value.avatar = avFile.url()
            uploadAvatarUrl.value = avFile.url()
        }
    }
})


// 验证码发送状态
const isSending = ref(false)
// 是否可以重新发送
const canResend = ref(true)
// 倒计时
const countdown = ref(60)
// 发送验证码的函数
const sendVerificationCode = async () => {
    // 防止重复发送
    if (!canResend.value) {
        return
    }

    if (currentLoginUser.value) {
        if (_.isEmpty(currentLoginUser.value.phone)) {
             useToast('请输入手机号码' )
            return
        }

        if (!(/^1\d{10}$/.test(currentLoginUser.value.phone))) {
             useToast('请输入正确的手机号码' )
            return
        }
        try {
            isSending.value = true
            await LC.Cloud.requestSmsCode(currentLoginUser.value.phone)
            // 这里应该调用您的实际发送验证码的 API
            // 示例：await apiSendVerificationCode(phoneOrEmail)

            // 启动倒计时
            startCountdown()
        }
        catch (error) {
            console.error('发送验证码失败', error)
             useToast('获取验证码失败' )
        }
        finally {
            isSending.value = false
        }
    }
    else {
         useToast('获取验证码失败' )
    }
}

// 倒计时逻辑
const { pause, resume } = useIntervalFn(() => {
    countdown.value--

    if (countdown.value <= 0) {
        // 倒计时结束
        resetCountdown()
    }
}, 1000, { immediate: false })

// 重置倒计时
const resetCountdown = () => {
    pause()
    countdown.value = 60
    canResend.value = true
}

// 开始倒计时
const startCountdown = () => {
    canResend.value = false
    countdown.value = 60
    resume()
}

const signUp = async () => {
    if (currentLoginUser.value) {
        console.log('currentLoginUser.value.gender', currentLoginUser.value.gender, typeof currentLoginUser.value.gender)
        if (smsCode.value.length !== 6) {
             useToast('请输入正确的验证码' )
        }
        if (_.isEmpty(currentLoginUser.value.name)) {
             useToast('请输入昵称' )
            return
        }
        if (_.isEmpty(currentLoginUser.value.email)) {
             useToast('请输入邮箱' )
            return
        }

        if (currentLoginUser.value.avatar === '') {
             useToast('请上传或选择头像' )
            return
        }
        if (!currentLoginUser.value.gender) {
             useToast('请设置性别' )
            return
        }

        if (_.isEmpty(currentLoginUser.value.email)) {
            useToast('请输入邮箱')
            return
        }
        if (!/^[\w.%+-]+@[a-z0-9.-]+(\.[a-z]{2,})$/i.test(currentLoginUser.value.email)) {
            useToast('请输入正确的邮箱')
            return
        }
        try {
            console.log(currentLoginUser.value.phone, smsCode.value.join('').trim())
            const lcUser = await LC.User.signUpOrlogInWithMobilePhone(currentLoginUser.value.phone, smsCode.value.join('').trim())
            currentLoginUser.value.user = lcUser
            console.log(currentLoginUser.value)
            await currentLoginUser.value.save()
             useToast('登录成功' )

            close()
            setTimeout(() => {
                window.location.reload()
            }, 200)
        }
        catch (e: unknown) {

            console.log(e)
            if (e instanceof Error) {
                 useToast(`短信验证码错误, ${e.message}` )
            } else {
                 useToast(`短信验证码错误` )
            }
        }
    }
}
const signIn = async () => {
    if (currentLoginUser.value) {


        if (_.isEmpty(currentLoginUser.value.phone)) {
             useToast('请输入手机号码' )
            return
        }

        if (!(/^1\d{10}$/.test(currentLoginUser.value.phone))) {
             useToast('请输入正确的手机号码' )
            return
        }

        console.log(currentLoginUser.value.gender)
        const hasUser = await new LC.Query(User).equalTo(EnumUser.PHONE, currentLoginUser.value.phone).count()
        if (hasUser === 0) {
             useToast('用户不存在，请先注册。' )
            return
        }
        if (smsCode.value.length !== 6) {
             useToast('请输入正确的验证码' )
            return
        }
        try {
            const lcUser = await LC.User.signUpOrlogInWithMobilePhone(currentLoginUser.value.phone, smsCode.value.join('').trim())
            const user = await new LC.Query(User).equalTo(EnumUser.PHONE, currentLoginUser.value.phone).first()

            if (user) {


                user.user = lcUser
                await user.save()

                 useToast('登录成功' )
                setUser(user)
                close()
                // 获取当前的路由

                window.location.replace(route.path)
            }
            else {
                 useToast('用户不存在' )
            }
        }
        catch (e) {
            console.log(e)
             useToast('短信验证码错误' )
        }
    }
}
</script>

<template>
    <div v-if="currentLoginUser" class="flex fixed z-[999] inset-0 bg-white">

        <div class="relative top-0 bottom-0 right-0 flex-shrink-0 w-60 2xl:w-96 overflow-hidden bg-cover ">
            <div class="opacity-0 dark:opacity-70 absolute inset-0 z-20 w-full h-full bg-gradient-to-t from-black" />

            <img src="https://file.newoakbay.com/R2jfCWFXbScpBvqEYmiUiLbOiEhoHUtx/login_bg.jpg" class="z-10 object-cover w-full h-full">
        </div>
        <div class="relative  flex flex-wrap items-center w-full h-full px-8">
            <Card class="mx-auto max-w-xl   shadow-[rgba(219,219,219,0.66)] shadow-lg px-10  rounded-xl">
                <CardHeader>
                    <CardTitle class="text-2xl font-[HLFont-Heavy]">
                        {{ signInOrSignUp === SignType.signUp ? '注册' : '登陆' }}
                    </CardTitle>
                    <CardDescription>
                        {{ signInOrSignUp === SignType.signUp ? '请使用手机号码免密注册' : '请使用手机号码快速登录' }}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid gap-6">
                        <div class="grid gap-3">
                            <Label for="email">手机号码</Label>
                            <div class="flex flex-row items-center  space-x-5 justify-between">
                                <Input v-model="currentLoginUser.phone" type="phone" class="w-44 !text-black" placeholder="" required />
                                <Button :disabled="!canResend" variant="secondary" class="w-32" @click="sendVerificationCode">
                                    <span v-if="!canResend" class="dy-countdown"><span :style="{ '--value': countdown }" /></span>
                                    <span v-else>发送验证码</span>
                                </Button>
                            </div>
                        </div>
                        <div class="grid gap-3">
                            <Label for="smsCode">验证码</Label>
                            <PinInput v-model="smsCode" placeholder="○" @complete="handleComplete">
                                <PinInputGroup class="gap-1">
                                    <template v-for="(id, index) in 6" :key="id">
                                        <PinInputInput class="rounded-md border !bg-white !text-black" :index="index" />
                                        <template v-if="index !== 5">
                                            <PinInputSeparator />
                                        </template>
                                    </template>
                                </PinInputGroup>
                            </PinInput>
                        </div>
                        <Transition name="bounce">
                            <div v-if="signInOrSignUp === SignType.signUp" class="grid gap-6">
                                <Separator />
                                <p class="text-sm text-muted-foreground">
                                    使用真实信息有助于团队快速识别您的身份，提升协作效率。
                                </p>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="grid gap-3">
                                        <Label for="realName">昵称</Label>
                                        <Input v-model="currentLoginUser.name" placeholder="" required />
                                    </div>
                                    <div class="grid gap-3">
                                        <Label for="realName">性别</Label>
                                        <div class="flex flex-row items-center space-x-6">
                                            <div class="flex flex-row items-center space-x-2 text-xs      ">
                                                <Label for="gender">男</Label>
                                                <input v-model.number="currentLoginUser.gender" type="radio" name="gender" :value="1" class="dy-radio dy-radio-sm" :checked="currentLoginUser.gender === 1">
                                            </div>

                                            <div class="flex flex-row items-center space-x-2  ">
                                                <Label for="gender">女</Label>
                                                <input v-model.number="currentLoginUser.gender" type="radio" name="gender" :value="2" class="dy-radio dy-radio-sm" :checked="currentLoginUser.gender === 2">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid gap-3">
                                    <Label for="email">邮箱</Label>
                                    <Input v-model="currentLoginUser.email" type="email" placeholder="" required />
                                </div>
                            </div>
                        </Transition>
                        <Button v-if="signInOrSignUp === SignType.signIn" type="submit" class="w-full" @click="signIn">
                            登陆
                        </Button>
                        <Button v-if="signInOrSignUp === SignType.signUp" type="submit" class="w-full" @click="signUp">
                            创建新账号
                        </Button>
                    </div>
                    <!-- <Separator class="my-4" /> -->
                    <div v-if="signInOrSignUp === SignType.signUp" class="mt-4 text-center text-sm">
                        已经有账号？
                        <a href="#" class="underline" @click="signInOrSignUp = SignType.signIn">
                            登陆
                        </a>
                    </div>
                    <div v-else class="mt-4 text-center text-sm">
                        还没有有账号？
                        <a href="#" class="underline text-destructive" @click="signInOrSignUp = SignType.signUp">
                            注册
                        </a>
                    </div>
                </CardContent>
                <CardFooter>
                    <div class=" text-little w-full text-muted-foreground flex flex-col items-center justify-center  ">
                        <Separator class="my-2" />
                        <div class="flex items-center justify-center  ">
                            <!-- <img src="~/assets/logo.png" alt="Project Home" class="w-8 h-8 object-contain" /> -->
                            <p class="ml-2">
                                © 2025 上海恒领软件有限公司 版权所有
                            </p>
                        </div>
                        <div class="flex items-center justify-center  mt-1.5 gap-x-2">
                            <img src="https://ai.file.kop-consulting.com/fgfiImwNJRA5xLAfs3txrrXRW3xmVeKd/beian.png" class="w-4 h-4">
                            <a href="https://beian.miit.gov.cn/" target="_blank" class=" underline underline-offset-4 text-sm">
                                沪ICP备16043728号
                            </a>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
</template>

<style>
@media (prefers-color-scheme: dark) {
    input, textarea {
        background-color: white;
        color: #000000;
    }
}
</style>
