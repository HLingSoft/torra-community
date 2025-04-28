<script lang="ts" setup>
import type { APIToolData } from '@/types/node-data/api-tool'


import { apiToolMeta } from '@/types/node-data/api-tool'

import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
    id: String,

})

const currentNode = ref<{ id: string, data?: APIToolData }>()

const toolNameInputVariableRef = ref<HTMLElement | null>(null)
const toolDescriptionInputVariableRef = ref<HTMLElement | null>(null)
const urlInputVariableRef = ref<HTMLElement | null>(null)
const bodyVariableRef = ref<HTMLElement | null>(null)
const tokenVariableRef = ref<HTMLElement | null>(null)


const toolOutputVariableRef = ref<HTMLElement | null>(null)

const { addInputPort, addOutputPort, removePort, updateNodePosition } = createPortManager()
const { nodes, edges } = storeToRefs(useWorkflowStore())
onMounted(async () => {
    const node = nodes.value.find(node => node.id === props.id)
    if (!node) {
        return
    }

    // 初始化 data
    node.data = {
        ..._.cloneDeep(apiToolMeta),
        ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
    } as APIToolData

    currentNode.value = node

    await nextTick() // 等待 DOM 渲染完毕
    // ✅ 给每个字段位置添加 Input Port

    if (toolNameInputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.toolNameVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value!.data!.toolNameVariable.id, 'aquamarine', toolNameInputVariableRef.value.offsetTop + toolNameInputVariableRef.value.clientHeight / 2)
    }

    if (toolDescriptionInputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.toolDescriptionVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value!.data!.toolDescriptionVariable.id, 'aquamarine', toolDescriptionInputVariableRef.value.offsetTop + toolDescriptionInputVariableRef.value.clientHeight / 2)
    }

    if (tokenVariableRef.value && !node.data.saved) {
        currentNode.value.data!.tokenVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value.data!.tokenVariable.id, 'aquamarine', tokenVariableRef.value.offsetTop + tokenVariableRef.value.clientHeight / 2)
    }

    if (urlInputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.urlInputVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value!.data!.urlInputVariable.id, 'aquamarine', urlInputVariableRef.value.offsetTop + urlInputVariableRef.value.clientHeight / 2)
    }
    if (bodyVariableRef.value && !node.data.saved) {
        currentNode.value.data!.bodyVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value.data!.bodyVariable.id, 'aquamarine', bodyVariableRef.value.offsetTop + bodyVariableRef.value.clientHeight / 2)
    }



    if (toolOutputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.toolOutputVariable.id = nanoLowercaseAlphanumericId(10)
        addOutputPort(props.id!, currentNode.value.data!.toolOutputVariable.id, 'pink', toolOutputVariableRef.value.offsetTop + toolOutputVariableRef.value.clientHeight / 2)
    }


})



watch(edges, () => {

    if (!currentNode.value?.data) {
        return
    }

    currentNode.value.data.toolNameVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.toolNameVariable.id)
    currentNode.value.data.toolDescriptionVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.toolDescriptionVariable.id)
    currentNode.value.data.urlInputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.urlInputVariable.id)
    currentNode.value.data.bodyVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.bodyVariable.id)
    currentNode.value.data.tokenVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.tokenVariable.id)
}, { deep: true, immediate: true })

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {


})



const methods = ref([

    { id: 'get', name: 'GET' },
    { id: 'post', name: 'POST' },


])

const bodyVariableIsOpen = ref(false)
const bodyVariableClonedData = ref<Record<string, string>>({})
const saveBodyVariable = () => {
    if (!currentNode.value) {
        return
    }
    currentNode.value.data!.bodyVariable.value = bodyVariableClonedData.value
    bodyVariableIsOpen.value = false
}
watch(bodyVariableIsOpen, (val) => {
    if (val) {
        bodyVariableClonedData.value = currentNode.value?.data?.bodyVariable.value || []
    } else {
        bodyVariableClonedData.value = {}
    }
}, { immediate: true })


watch(() => currentNode.value?.data?.methodType, async (val, oldVal) => {
    if (!currentNode.value) return
    const nodeId = currentNode.value.id

    if (val === 'get') {
        // ✅ 清空 body
        currentNode.value.data!.bodyVariable.value = {}

        // ✅ 移除 body input port
        removePort(currentNode.value.data!.bodyVariable.id)



        // ✅ 更新主 output port 位置
        await nextTick()

        if (toolOutputVariableRef.value && currentNode.value.data!.toolOutputVariable.id) {
            const y = toolOutputVariableRef.value.offsetTop + toolOutputVariableRef.value.clientHeight / 2 + 4
            updateNodePosition(currentNode.value.data!.toolOutputVariable.id, y)
        }

    } else {
        // ✅ 添加 body input port
        await nextTick()

        if (bodyVariableRef.value) {
            const id = nanoLowercaseAlphanumericId(10)
            currentNode.value.data!.bodyVariable.id = id
            addInputPort(nodeId, id, 'aquamarine', bodyVariableRef.value.offsetTop + bodyVariableRef.value.clientHeight / 2)
        }

        // ✅ 更新主 output port 位置
        await nextTick()


        if (toolOutputVariableRef.value && currentNode.value.data!.toolOutputVariable.id) {
            const y = toolOutputVariableRef.value.offsetTop + toolOutputVariableRef.value.clientHeight / 2 + 4
            updateNodePosition(currentNode.value.data!.toolOutputVariable.id, y)
        }
    }
}, { immediate: true })

</script>

<template>
    <div>
        <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-background  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-card   focus:border focus: border-card">

            <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />
            <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
                <Separator class="my-5" />

                <div ref="toolNameInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Tool Name<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <EditTextDialog class="w-full" :disabled="currentNode.data.toolNameVariable.connected" :model-value="currentNode.data.toolNameVariable.value || ''" placeholder="" @save="(val) => currentNode!.data!.toolNameVariable.value = val" />

                    </div>
                    <div class="mt-3 text-xs text-muted-foreground">必须是纯英文、下划线、小写字母组成的。</div>
                </div>

                <div ref="toolDescriptionInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Tool Description<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <EditTextDialog class="w-full" :disabled="currentNode.data.toolDescriptionVariable.connected" :model-value="currentNode.data.toolDescriptionVariable.value || ''" placeholder="" @save="(val) => currentNode!.data!.toolDescriptionVariable.value = val" />

                    </div>

                </div>

                <div ref="urlInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>URL<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <EditTextDialog class="w-full" :disabled="currentNode.data.urlInputVariable.connected" :model-value="currentNode.data.urlInputVariable.value || ''" placeholder="请输入地址" @save="(val) => currentNode!.data!.urlInputVariable.value = val" />

                    </div>
                    <div class="mt-3 text-xs text-muted-foreground">以 http/https 开头。例如:https://www.baidu.com</div>
                </div>

                <div ref="tokenVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Token</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <EditTextDialog class="w-full" :disabled="currentNode.data.tokenVariable.connected" :model-value="currentNode.data.tokenVariable.value || ''" placeholder="请输入地址" @save="(val) => currentNode!.data!.tokenVariable.value = val" />

                    </div>
                    <div class="mt-3 text-xs text-muted-foreground"></div>
                </div>


                <div class="w-full">
                    <div class="flex flex-row items-center space-x-2 w-full">
                        <p>Method</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full flex items-center justify-between  mt-4">
                        <Select v-model="currentNode.data.methodType" class="w-full">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a model name" />
                            </SelectTrigger>
                            <SelectContent class="w-full dark">
                                <SelectGroup>
                                    <SelectItem v-for="method in methods" :key="method.id" :value="method.id">
                                        {{ method.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>



                <div v-if="currentNode.data.methodType !== 'get'" ref="bodyVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Body<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <Button :disabled="currentNode.data.bodyVariable.connected" variant="outline" class="w-full" @click.stop="bodyVariableIsOpen = true">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Open Table
                        </Button>
                    </div>
                </div>


            </CardContent>


            <div ref="toolOutputVariableRef" class="bg-card   py-2 pl-5 pr-10  flex items-center justify-center">
                <div class="w-full h-full   flex items-center  justify-between">
                    <NuxtIcon v-if="currentNode.data.toolOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.toolOutputVariable.show = false" />

                    <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.toolOutputVariable.show = true" />

                    <div class="  ">
                        Tool
                    </div>
                </div>
            </div>
        </Card>

        <Dialog v-model:open="bodyVariableIsOpen">
            <DialogContent class="dark  flex flex-col text-white w-full !max-w-7xl h-[80vh]">
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
                    <KeyValueEditor class="h-full" v-model="bodyVariableClonedData" />
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
