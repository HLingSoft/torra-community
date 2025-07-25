<script setup lang="ts">

import Payment from '~~/models/Payment'
import { useIntervalFn } from '@vueuse/core'



const emit = defineEmits(['close'])
const { user } = storeToRefs(useUserStore())

/* ----------------- 充值业务变量 ----------------- */
const rechargeAmount = ref(10)                // 充值金额（元），默认 10
const amount = computed(() => rechargeAmount.value)

const payObject = ref<Payment | null>(null)
const payQRCode = ref<string>('')

/* 新增倒计时 */
const countdown = ref(60)
const { pause: pauseCd, resume: resumeCd } = useIntervalFn(() => {
    if (isPaymentSuccess.value || payTimeout.value) {
        pauseCd()             // 成功 / 已经超时 → 不再倒计时
        return
    }

    if (countdown.value <= 0) {
        payTimeout.value = true   // ⬅️ ① 进入超时状态
        pauseCd()                 // 停止倒计时
        pause()                   // 停止 3 s 轮询
        return                    // 不再自动 fetchUrl()
    }

    countdown.value--
}, 1000)

/* 状态控制 / 轮询 */
const isPaymentSuccess = ref(false)
const payTimeout = ref(false)
const count = ref(0)
const MAX_COUNT = 20

/* 每 5 秒轮询支付结果 */
const { pause, resume } = useIntervalFn(async () => {
    if (count.value >= MAX_COUNT) {
        isPaymentSuccess.value = false
        payTimeout.value = true
        if (payObject.value) await payObject.value.destroy()
        payQRCode.value = ''
        pause()
        return
    }
    count.value++
    payTimeout.value = false

    if (payObject.value) {
        try {
            await payObject.value.fetch()
            if (payObject.value.success) {
                isPaymentSuccess.value = true
                useToast('支付成功')
                pause()
                setTimeout(() => window.location.replace('/me/finance'), 2000)
            } else {
                isPaymentSuccess.value = false
            }
        } catch (e) {
            console.error('Fetch error:', e)
            isPaymentSuccess.value = false
        }
    }
}, 3000)

/* 金额改变 => 重新生成二维码 */
watch(rechargeAmount, async val => {
    if (val < 1) rechargeAmount.value = 1
    await fetchUrl()
}, { deep: true, immediate: true })

/* 调用云函数创建订单 & 获取二维码 */
const fetchUrl = async () => {
    if (!payObject.value) return

    payObject.value.amount = rechargeAmount.value
    payObject.value.prepay_id = nanoLowercaseAlphanumericId(16)



    /* ===== 重新启动流程 ===== */
    payTimeout.value = false          // ⬅️ ② 退出超时状态
    isPaymentSuccess.value = false
    count.value = 0                   // 重置轮询计数
    countdown.value = 60              // 重置倒计时
    resumeCd()                        // 倒计时重新开始
    resume()                          // 3 s 轮询重新开始
}

/* 初始化 Payment 对象、首次生成二维码 */
onMounted(async () => {
    if (!user.value) return useToast('请先登录')

    payObject.value = new Payment()
    const attach = `${user.value.objectId}|${Date.now()}`

    payObject.value.user = user.value
    payObject.value.mp_openid = user.value.mp_openId
    payObject.value.success = false
    payObject.value.attach = attach

    await payObject.value.save()
    await fetchUrl()
    resumeCd()        // 首次启动倒计时
})
</script>

<template>
    <div class="flex fixed z-[999] inset-0 bg-white">
        <div class="absolute top-4 right-4 z-[999]">
            <Button variant="ghost" @click="emit('close')">
                <NuxtIcon name="ri:close-line" size="20" class="text-gray-500" />
                <span class="sr-only">关闭支付界面</span>
            </Button>
        </div>
        <div class="relative top-0 bottom-0 right-0 flex-shrink-0 w-60 2xl:w-96 overflow-hidden bg-cover ">
            <div class="opacity-0 dark:opacity-70 absolute inset-0 z-20 w-full h-full bg-gradient-to-t from-black" />

            <img src="https://file.newoakbay.com/R2jfCWFXbScpBvqEYmiUiLbOiEhoHUtx/login_bg.jpg" class="z-10 object-cover w-full h-full">
        </div>
        <div class="relative  flex flex-wrap items-center w-full h-full px-8">

            <div class="flex flex-col items-center  mx-auto">
                <!-- 充值金额输入 -->
                <div class="font-extrabold text-2xl mb-6 pb-4 border-b ">Torra 在线充值</div>
                <div class="flex flex-row items-center text-sm leading-4 gap-x-10">

                    <div class="font-extrabold">充值金额（元）</div>
                    <div class="w-80">
                        <NumberField id="rechargeAmount" v-model="rechargeAmount" :default-value="50" :min="1" :max="2999">
                            <NumberFieldContent>
                                <NumberFieldDecrement />
                                <NumberFieldInput />
                                <NumberFieldIncrement />
                            </NumberFieldContent>
                        </NumberField>
                    </div>
                </div>

                <!-- 应付金额 -->
                <div class="leading-4 my-5">
                    <div class="mt-2 leading-4 font-semibold">
                        应付金额：￥
                        <span class="text-red-500 text-3xl italic font-extrabold">{{ amount }}</span>
                    </div>
                </div>

                <!-- 二维码 / 成功 / 超时 -->
                <div class="py-6 border-t-2 border-gray-100">
                    <!-- 等待支付 -->
                    <div v-if="!isPaymentSuccess && !payTimeout">
                        <div v-if="payQRCode && user" class="bg-gray-100 relative rounded-lg p-1 w-[290px] aspect-square flex animate-fadeIn animate-faster items-center justify-center">
                            <vue-qrcode :value="payQRCode" :quality="1" :color="{ dark: '#000000ff', light: '#ffffffff' }" type="image/webp" :width="250" />

                        </div>
                        <div v-else class="w-[290px] aspect-square bg-slate-100 rounded-lg" />
                        <!-- 倒计时 -->
                        <div class="w-full flex flex-row items-center justify-center">

                            <div class="mt-4">
                                <span class="countdown font-mono text-2xl text-primary">
                                    <span :style="{ '--value': countdown }"></span>s
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 支付成功 -->
                    <div v-else-if="isPaymentSuccess" class="animate-fadeIn">
                        <div class="w-[290px] my-5 text-green-300 aspect-square bg-slate-50 rounded-lg flex items-center justify-center flex-row font-extrabold text-sm">
                            <NuxtIcon name="icon-park-outline:done-all" size="20" class="mx-3" />
                            支付成功
                        </div>
                    </div>

                    <!-- 支付超时 -->
                    <div v-else class="animate-fadeIn">
                        <div class="w-[290px] my-5 text-primary aspect-square bg-slate-50 rounded-lg flex flex-col items-center justify-center font-extrabold text-sm">
                            <div class="flex flex-row items-center">
                                <NuxtIcon name="clarity:error-line" size="22" class="mx-3" />
                                支付超时
                            </div>
                            <div>
                                <Button variant="destructive" class="mt-3" @click="fetchUrl">重新生成二维码</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 支付方式说明 -->
                <div class="text-black mt-5 font-extrabold text-base flex flex-row mb-3 items-center">
                    <NuxtIcon name="ri:wechat-pay-line" size="18" class="mx-2" />
                    使用微信安全支付
                </div>


            </div>

        </div>
    </div>

</template>
