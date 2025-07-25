<script setup lang="ts">
import UserFinance, { EnumUserFinance } from '~~/models/UserFinance'
import User from '~~/models/User'
import UserFinanceTransaction, { EnumUserFinanceTransaction } from '~~/models/UserFinanceTransaction'

definePageMeta({
    layout: 'me',
    title: 'Finance Dashboard',
    key: route => route.fullPath
})
type Item = {
    name: string
    color: string
    value: number
}

type Row = {
    date: string
    consume: Item
    recharge: Item
}
const { t } = useI18n()
const { user } = storeToRefs(useUserStore())
const allDayConsume = ref<{ date: string, consume: Item, recharge: Item }[]>([])
const dayjs = useDayjs()
const mineFinance = ref<UserFinance | null>(null)
const allTransactions = ref<UserFinanceTransaction[]>([])
const colorMode = useColorMode()

const consumeColor = computed(() => colorMode.value === 'dark' ? '#22c55e' : '#4ade80')
const rechargeColor = computed(() => colorMode.value === 'dark' ? '#2563eb' : '#60a5fa')


onMounted(async () => {
    await until(user).not.toBeNull()


    mineFinance.value = await new LC.Query(UserFinance)
        .equalTo(EnumUserFinance.USER, user.value)
        .first() as UserFinance
    if (!mineFinance.value) {
        mineFinance.value = new UserFinance()
        mineFinance.value.user = user.value as User
        mineFinance.value.totalRecharge = 0
        mineFinance.value.totalTokenConsume = 0
        mineFinance.value.balance = 0
        mineFinance.value.tokenBalance = 0
        await mineFinance.value.save()
    }

    console.log('mineFinance', mineFinance.value)
    allTransactions.value = await new LC.Query(UserFinanceTransaction)
        .include(EnumUserFinanceTransaction.WORKFLOW)
        .equalTo(EnumUserFinanceTransaction.USER, user.value)
        .include(EnumUserFinanceTransaction.USER)
      
        .descending(EnumUserFinanceTransaction.CREATEDAT)
        .limit(1000)
        .find() as UserFinanceTransaction[]
    console.log('allTransactions', allTransactions.value)

    // 用map存每一天的消费和充值
    const dailyMap: { [date: string]: { consume: number, recharge: number } } = {}

    allTransactions.value.forEach(tran => {
        const date = dayjs(tran.createdAt).format('YYYY-MM-DD')
        if (!dailyMap[date]) dailyMap[date] = { consume: 0, recharge: 0 }
        if (tran.type === 'consume') {
            dailyMap[date].consume += tran.amount
        } else if (tran.type === 'recharge') {
            dailyMap[date].recharge += tran.amount
        }
    })


    // 生成最终数组，带对象结构
    allDayConsume.value = Object.entries(dailyMap)
        .map(([date, obj]) => ({
            date,
            consume: {
                name: '消耗',
                color: consumeColor.value,
                value: obj.consume
            },
            recharge: {
                name: '充值',
                color: rechargeColor.value,
                value: obj.recharge
            }
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    console.log('allDayConsume', allDayConsume.value)

})

// const selectedRange = ref<'week' | 'month'>('week')
// const cnyFormatter = (n: unknown) => {
//     const num = Number(n)
//     return isNaN(num) ? '-' : `¥ ${num.toFixed(2)}`
// }
const showPay = ref(false)



</script>

<template>

    <div class="">
        <div v-if="mineFinance" class="pb-20">
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium">{{ t('Total Recharge') }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="text-2xl font-bold">¥{{ mineFinance.totalRecharge.toFixed(2) }}</div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium">{{ t('Current Balance') }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="text-2xl font-bold">¥{{ mineFinance.balance.toFixed(2) }}</div>
                    </CardContent>
                </Card>

                <div class="flex flex-col items-center justify-center p-4 bg-secondary/40 rounded-lg">
                    <Button class="w-44" @click="showPay = true">
                        <NuxtIcon name="tdesign:logo-wechatpay" size="18" />
                        微信在线充值
                    </Button>
                    <Button variant="outline" class="mt-6 w-44 ">
                        <NuxtIcon name="i-heroicons-currency-yen-solid" size="18" />
                        企业充值联系客服
                    </Button>

                </div>

                <div class="flex flex-col items-center justify-center p-4 bg-secondary/40 rounded-lg">
                    <img src="https://file.web.hlingsoft.com/1GIiiRvyyhQBMoFFiRL4GqaqaNqlvvDO/20241023-152905.jpeg" alt="微信客服" class="w-44 h-44 rounded-lg" />

                </div>

            </div>
            <ClientOnly>
                <div class="grid gap-4 my-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{{ t('Transaction History') }}</CardTitle>
                        </CardHeader>
                        <CardContent>


                            <AreaChart :data="allDayConsume" index="date" :categories="['consume', 'recharge']" :colors="[consumeColor, rechargeColor]" class="h-60 mt-10" :show-legend="false" :show-gradient="false">

                            </AreaChart>

                        </CardContent>
                    </Card>


                </div>
            </ClientOnly>
            <MeFinanceTable :allUserFinanceTransaction="allTransactions" />

        </div>
        <div>
            <Transition name="slide-fade" mode="out-in">
                <Pay v-if="showPay" @close="showPay = false"></Pay>
            </Transition>
        </div>
    </div>


</template>
<style>
/* 默认样式：light 模式 */
.unovis-tooltip {
  background-color: white;
  color: black;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* dark 模式下强制覆盖 */
.dark .unovis-tooltip {
  background-color: #1f2937; /* gray-800 */
  color: #f9fafb;            /* gray-50 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
</style>
