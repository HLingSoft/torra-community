<script lang="ts" setup>
import type { SubWorkflowData, KeyValueRow } from '@/types/node-data/sub-workflow'
import type { InputPortVariable } from '~/types/workflow'

import { subWorkflowMeta } from '@/types/node-data/sub-workflow'


const props = defineProps<{ id: string }>()
const bodyInputVariables = ref<InputPortVariable[]>([])
const variableRefs = ref<Record<string, HTMLElement | undefined>>({})
const currentNode = ref<{ id: string, data: SubWorkflowData } | null>(null)
const { edges } = storeToRefs(useWorkflowStore())

watchDebounced(
    () => currentNode.value?.data?.bodyInputVariable,
    (newVars, oldVars) => {
        if (!currentNode.value) return

        const bodyInputVariable = currentNode.value.data.bodyInputVariable
        if (!bodyInputVariable) return



        const oldMap = Object.fromEntries((oldVars ?? []).map(v => [v.id, v])) // ✅ 用 id 映射

        const newIds = (newVars ?? []).map(v => v.id)
        const oldIds = (oldVars ?? []).map(v => v.id)


        const newIdSet = new Set(newIds)

        const removedHandleIds = oldIds
            .filter(id => !newIdSet.has(id)) // ✅ 正确：id 是 string
            .map(id => `${id}`) // ✅ 正确拼接 handle id


        const updatedVars: InputPortVariable[] = (newVars ?? []).map(v => {
            const old = oldMap[v.id]
            return {
                ...v,
                id: v.id ?? nanoLowercaseAlphanumericId(10), // ✅ 保底生成 ID
                value: old?.value ?? '',
                connected: old?.connected ?? false,
                allowedTypes: ['Data'],

            }
        })


        edges.value = edges.value.filter(edge => {
            const target = edge.targetHandle
            return !(target && removedHandleIds.includes(target))
        })





        // 赋值新列表，自动移除多余变量
        currentNode.value.data.bodyInputVariable = updatedVars
        bodyInputVariables.value = updatedVars


    },
    { immediate: true, debounce: 500, deep: true }
)
const variableMap = computed(() => {
    return Object.fromEntries(
        currentNode.value?.data.bodyInputVariable.map(v => [v.id, v]) ?? []
    )
})


const bodyVariableIsOpen = ref(false)
const bodyVariableClonedData = ref<KeyValueRow[]>([])

const saveBodyVariable = () => {
    if (!currentNode.value) return

    // 1. 存 KeyValueRow 给表格回显
    currentNode.value.data!.bodyKeyValueRows = _.cloneDeep(bodyVariableClonedData.value)

    /** 2. 转成 InputPortVariable[]，保持 varId 不变 */
    currentNode.value.data!.bodyInputVariable = bodyVariableClonedData.value.map(
        (item) => {
            // 若已有 varId 就复用，否则生成一次并写回
            if (!item.varId) {
                item.varId = nanoLowercaseAlphanumericId(10); // e.g. "k3h9a2d0xq"
            }

            return {
                name: item.key,
                id: item.varId,            // **固定使用 varId**
                value: item.value,
                allowedTypes: ['Data'],
                connected: false,
            };
        },
    );
    bodyVariableIsOpen.value = false
}


watch(bodyVariableIsOpen, () => {
    if (bodyVariableIsOpen.value) {
        bodyVariableClonedData.value = _.cloneDeep(currentNode.value?.data?.bodyKeyValueRows ?? [])
        bodyVariableIsOpen.value = true
    }
})


</script>



<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="subWorkflowMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">

                <div>
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.urlInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.urlInputVariable" />

                    </div>
                    <div class="mt-3 text-xs text-muted-foreground">以 http/https 开头。例如:https://www.baidu.com。仅支持 POST 请求。</div>
                </div>

                <div ref="tokenVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.tokenInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.tokenInputVariable" />

                    </div>
                    <div class="mt-3 text-xs text-muted-foreground"></div>
                </div>





                <div>
                    <div class=" flex flex-row items-center space-x-2">
                        <p>Body<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <Button variant="outline" class="w-full" @click.stop="bodyVariableIsOpen = true">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Open Table
                        </Button>
                    </div>
                </div>
                <div class="flex flex-col space-y-8">
                    <div v-for="variable in currentNode.data.bodyInputVariable" :ref="el => variableRefs[variable.id] = el as HTMLElement" :key="variable.id">
                        <div class="flex flex-row items-center space-x-2">
                            <p>{{ variable.name }}</p>
                        </div>
                        <div class="w-full mt-5">
                            <EditTextDialog class="w-full" placeholder="请输入字段名称" v-model:inputVariable="variableMap[variable.id]" />

                        </div>
                    </div>
                </div>
            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.dataOutputVariable" />

            </template>
        </WorkflowBaseNode>
        <Dialog v-model:open="bodyVariableIsOpen">
            <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="dark  flex flex-col text-white w-full !max-w-7xl h-[80vh]">
                <DialogHeader class="shrink-0">
                    <DialogTitle>
                        <div class="flex flex-row items-center space-x-2">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Body
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Edit text content.
                    </DialogDescription>
                </DialogHeader>
                <div class="flex-1 overflow-auto">
                    <ApiToolSchema class="h-full" v-model="bodyVariableClonedData" />
                </div>

                <DialogFooter class="w-full shrink-0 flex flex-row items-center justify-between">

                    <Button @click="saveBodyVariable">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


    </div>
</template>
