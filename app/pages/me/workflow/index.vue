<script lang="ts" setup>
import Workflow, { EnumWorkflow } from '~~/models/Workflow';
import WorkflowUserShare, { EnumWorkflowUserShare } from '~~/models/WorkflowUserShare';
definePageMeta({
    layout: 'me',
    title: '工作流',

});
const { user } = storeToRefs(useUserStore());
const allWorkflow = ref<Workflow[]>([]);
const isFetching = ref(true);
onMounted(async () => {
    isFetching.value = true;

    await until(user).not.toBeNull();

    allWorkflow.value = await new LC.Query(Workflow)
        .equalTo(EnumWorkflow.USER, user.value)
        .include(EnumWorkflow.USER)
        // .select(EnumWorkflow.USER + ".objectId", EnumWorkflow.USER + ".name", EnumWorkflow.NAME, EnumWorkflow.OBJECTID, EnumWorkflow.TOKEN)

        .find();
    const meJoinedWorkflows = await new LC.Query(WorkflowUserShare)
        .include(EnumWorkflowUserShare.WORKFLOW + ".user")
        .include(EnumWorkflowUserShare.WORKFLOW)
        .include(EnumWorkflowUserShare.USER)
        // .select(EnumWorkflowUserShare.WORKFLOW + ".user" + ".objectId", EnumWorkflowUserShare.WORKFLOW + ".user" + ".name", EnumWorkflowUserShare.WORKFLOW + ".name", EnumWorkflowUserShare.WORKFLOW + ".objectId", EnumWorkflowUserShare.WORKFLOW + ".token", EnumWorkflowUserShare.USER + ".objectId", EnumWorkflowUserShare.USER + ".name")

        .equalTo(EnumWorkflowUserShare.USER, user.value)
        .find() as WorkflowUserShare[]


    //把 meJoinedWorkflows 中的 workflow 加入到 allWorkflows 中
    meJoinedWorkflows.forEach((share: WorkflowUserShare) => {
        if (!allWorkflow.value.some(workflow => workflow.objectId === share.workflow.objectId)) {
            allWorkflow.value.push(share.workflow)
        }
    })
    //再判断 allWorkflows 中是否有重复的 workflow，如果有，则去重
    allWorkflow.value = allWorkflow.value.filter((workflow, index, self) =>
        index === self.findIndex((w) => w.objectId === workflow.objectId)
    )

    //给 workflow 加上 temp_isMine 属性
    allWorkflow.value.forEach((workflow: Workflow) => {
        workflow.temp_isMine = workflow.user.objectId === user.value?.objectId

    })

    isFetching.value = false
});

const detailOne = (workflow: Workflow) => {
    console.log('detailOne', workflow);
    navigateTo('/me/workflow/' + workflow.objectId);

}


const deleteOne = async (workflow: Workflow) => {
    const ok = await useConfirm({
        title: '删除工作流',
        description: '确定删除该工作流吗？',
        confirmText: '确定',
        cancelText: '取消',
    })
    if (ok) {
        allWorkflow.value = allWorkflow.value.filter(w => w.objectId !== workflow.objectId);
        await workflow.destroy()
        useToast('工作流已删除')


    }


}
const toWorkflowPage = () => {
    // navigateTo('/me/workflow');
    //打开新窗口
    window.open('/workflow', '_blank');
}
</script>


<template>
    <div class="flex flex-col items-start space-y-2 p-6 w-full   h-full">
        <div class="mb-6 text-sm  shrink-0 flex items-center justify-between w-full">
            <div class="">
                <h3 class="text-lg font-medium">
                    Workflows
                </h3>
                <p class="text-sm text-muted-foreground ">
                    Here you can manage your workflows. You can create, edit, and delete workflows, as well as share them with other users.
                </p>
            </div>
            <div>
                <Button @click="toWorkflowPage"> Create Workflow</Button>
            </div>

        </div>
        <Separator class="mb-4" />
        <div class="flex-1   w-full pb-10">
            <div v-if="isFetching" class="flex flex-col items-center justify-center space-y-4 mt-10">
                <Skeleton class="h-2 w-96 bg-muted" />
                <Skeleton class="h-2 w-96 bg-muted" />
                <Skeleton class="h-2 w-96 bg-muted" />
                <Skeleton class="h-2 w-96 bg-muted" />
                <Skeleton class="h-2 w-96 bg-muted" />
                <Skeleton class="h-2 w-96 bg-muted" />
            </div>
            <MeWorkflowTable v-if="!isFetching" :all-workflow="allWorkflow" @detail-one="detailOne" @delete-one="deleteOne" />

        </div>
    </div>
</template>
