<script setup lang="ts">
import Workflow, { EnumWorkflow } from '~~/models/Workflow';
definePageMeta({
    layout: 'me',
    title: '工作流详情',
});
const route = useRoute();
const { user } = storeToRefs(useUserStore());
const workflow = ref<Workflow | null>(null);
const isFetching = ref(true);
onMounted(async () => {
    isFetching.value = true;
    await until(user).not.toBeNull();

    const workflowId = route.params.id as string;
    if (!workflowId) {
        throw new Error('Workflow ID is required');
    }

    workflow.value = await new LC.Query(Workflow)
        .include(EnumWorkflow.USER)
        .get(workflowId);

    isFetching.value = false;
});
const back = () => {
    navigateTo('/me/workflow');
};

const { copy } = useClipboard();
const copyToken = () => {

    copy(workflow.value!.token);
    useToast('Token已复制到剪贴板');

};
</script>


<template>
    <div class="flex flex-col items-start space-y-2 p-6 w-full h-full">
        <div v-if="workflow" class="mb-6 text-sm shrink-0 flex flex-col ">
            <div class="flex items-center gap-2">
                <NuxtIcon @click="back" name="icon-park-outline:back-one" size="20" class="cursor-pointer"></NuxtIcon><span class="text-lg font-semibold">{{ workflow.name }}</span>
            </div>
            <div class="mt-4 text-muted-foreground">
                {{ workflow.description }}
            </div>
            <div class="mt-2 text-muted-foreground flex items-center gap-x-1">
                Token: <p class="text-primary bg-muted px-3 py-0.5 rounded-2xl">{{ workflow.token }}</p>
                <NuxtIcon name="basil:copy-outline" size="16" class="inline cursor-pointer ml-1" @click="copyToken" />
            </div>
        </div>
        <div class="w-full">
            <MeWorkflowUsage v-if="!isFetching && workflow" :workflow="(workflow as Workflow)" />
            <div v-else class="flex flex-col items-center justify-center space-y-2">
                <Skeleton class="h-2 w-96 bg-muted" />
                <Skeleton class="h-2 w-96 bg-muted" />
                <Skeleton class="h-2 w-96 bg-muted" />
            </div>

        </div>
    </div>
</template>
