<script setup lang="ts">
import Workflow, { EnumWorkflow } from '~~/models/Workflow'
import WorkflowUserShare, { EnumWorkflowUserShare } from '~~/models/WorkflowUserShare'
import User from '~~/models/User'

definePageMeta({
    title: '工作流协作邀请',
    description: '工作流协作邀请页面',
    layout: 'join',
    colorMode: 'light'      // 👈 真正锁定浅色的关键

})


const route = useRoute()
const { workflow, from } = route.query
const currentWorkflow = ref<Workflow | null>(null)
const fromUser = ref<User | null>(null)
const { user, isLoggedIn } = storeToRefs(useUserStore())
const allWorkflowUser = ref<WorkflowUserShare[]>([])
const isDoingJoin = ref(false)
const showLoginTeleport = ref(false)
const closeLogin = () => {
    showLoginTeleport.value = false
}
onMounted(async () => {
    if (workflow && from) {
        fromUser.value = await new LC.Query(User).get(from.toString()) as User
        currentWorkflow.value = await new LC.Query(Workflow).include(EnumWorkflow.USER).get(workflow.toString()) as Workflow
        allWorkflowUser.value = await new LC.Query(WorkflowUserShare).equalTo(EnumWorkflowUserShare.WORKFLOW, currentWorkflow.value).include(EnumWorkflow.USER).find() as WorkflowUserShare[]

    }

})

const agree = async () => {
    if (!isLoggedIn.value) {
        showLoginTeleport.value = true
        return
    }
    if (!currentWorkflow.value || !fromUser.value) {
        useToast('工作流或邀请人信息不完整')
        return
    }
    if (!user.value) {
        useToast('请先登录')
        return
    }
    if (user.value.objectId === fromUser.value.objectId) {
        useToast('不能邀请自己加入工作流')
        return
    }
    if (allWorkflowUser.value.some(item => item.user.id === user.value?.id && item.workflow.id === currentWorkflow.value?.id)) {
        useToast('您已经是该工作流的成员了')
        return
    }
    isDoingJoin.value = true
    const workflowUserShare = new WorkflowUserShare()
    workflowUserShare.user = user.value as User
    workflowUserShare.fromUser = fromUser.value as User
    workflowUserShare.workflow = currentWorkflow.value as Workflow
    await workflowUserShare.save()
    isDoingJoin.value = false
    useToast('加入工作流成功')
    navigateTo(`/workflow`)


}

const allFormattedUser = computed(() => {
    return allWorkflowUser.value.map(item => {
        return {
            id: item.user.objectId,
            name: item.user.name,
            avatar: item.user.avatar
        }
    })
})
</script>

<template>
    <section class="flex flex-col items-center justify-center   relative py-20">
        <dotlottie-vue class="absolute top-10 w-52 h-52" autoplay loop src="https://file.web.hlingsoft.com/xBmpzLD8EuQPKwS8FwUfxnnw39kLQ5X2/success.lottie" />
        <Card v-if="fromUser && currentWorkflow">

            <CardTitle class="text-2xl font-bold text-center">工作流协作邀请</CardTitle>
            <CardDescription class="text-center ">
                Let’s complete your workflow together.
            </CardDescription>

            <CardContent class="w-[600px]  ">
                <div>


                    <div class="flex flex-col items-center justify-center mt-10">
                        <div class="font-extrabold  flex flex-col items-center gap-y-2  ">
                            <Avatar class="w-20 h-20">
                                <AvatarImage :src="fromUser.avatar" :alt="fromUser.name" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div> {{ fromUser.name }}</div>

                        </div>
                        <div class="flex flex-row items-center mt-10">
                            邀请你加入<span class="text-primary">【{{ currentWorkflow.name }}】</span>工作流协作团队。
                        </div>
                    </div>

                    <div class="flex flex-row justify-center  items-center   w-full gap-x-2 my-10">

                        <Button :disabled="isDoingJoin" @click="agree" class="w-full max-w-xs cursor-pointer">
                            <NuxtIcon name="i-heroicons-check-circle-solid" size="22" class="mr-2" />
                            {{ isDoingJoin ? '正在处理' : '接受' }}
                        </Button>
                    </div>
                    <Separator class="my-3" />
                    <div v-if="allFormattedUser && allFormattedUser.length > 0" class="flex flex-col items-center mb-4">
                        <AvatarGroup :users="allFormattedUser" />
                        <span class="mt-2 text-gray-600 text-sm">
                            已有 {{ allWorkflowUser.length }} 人加入
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
        <ClientOnly>
            <Transition name="slide-fade" mode="out-in">
                <Login v-if="showLoginTeleport" @close="closeLogin" />
            </Transition>
        </ClientOnly>
    </section>
</template>
