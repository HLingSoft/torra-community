<script lang="ts" setup>
import type { APIRequestData } from '@/types/node-data/api-request'


import { apiRequestMeta } from '@/types/node-data/api-request'

import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
    id: String,

})

const currentNode = ref<{ id: string, data?: APIRequestData }>()


const urlInputVariableRef = ref<HTMLElement | null>(null)
const bodyVariableRef = ref<HTMLElement | null>(null)

const dataOutputVariableRef = ref<HTMLElement | null>(null)
const dataFrameOutputVariableRef = ref<HTMLElement | null>(null)

const { addInputPort, addOutputPort ,removePort,updateNodePosition} = createPortManager()
const { nodes, edges } = storeToRefs(useWorkflowStore())
onMounted(async () => {
    const node = nodes.value.find(node => node.id === props.id)
    if (!node) {
        return
    }

    // 初始化 data
    node.data = {
        ...apiRequestMeta,
        ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
    } as APIRequestData

    currentNode.value = node

    await nextTick() // 等待 DOM 渲染完毕
    // ✅ 给每个字段位置添加 Input Port


    if (urlInputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.urlInputVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value!.data!.urlInputVariable.id, 'aquamarine', urlInputVariableRef.value.offsetTop + urlInputVariableRef.value.clientHeight / 2)
    }
    if (bodyVariableRef.value && !node.data.saved) {
        currentNode.value.data!.bodyVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value.data!.bodyVariable.id, 'aquamarine', bodyVariableRef.value.offsetTop + bodyVariableRef.value.clientHeight / 2)
    }


 
    if (dataOutputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.dataOutputVariable.id = nanoLowercaseAlphanumericId(10)
        addOutputPort(props.id!, currentNode.value.data!.dataOutputVariable.id, 'pink', dataOutputVariableRef.value.offsetTop + dataOutputVariableRef.value.clientHeight / 2)
    }

    if (dataFrameOutputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.dataFrameOutputVariable.id = nanoLowercaseAlphanumericId(10)
        addOutputPort(props.id!, currentNode.value.data!.dataFrameOutputVariable.id, 'pink', dataFrameOutputVariableRef.value.offsetTop + dataFrameOutputVariableRef.value.clientHeight / 2)
    }


})



watch(edges, () => {
    console.log('prompt.vue edges', edges.value)
    if (!currentNode.value?.data) {
        return
    }


    currentNode.value.data.urlInputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.urlInputVariable.id)
    currentNode.value.data.bodyVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.bodyVariable.id)
}, { deep: true, immediate: true })

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
    console.log('nodeId:', event.node.id)
    console.log('完整事件对象:', event)
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
    if (dataOutputVariableRef.value && currentNode.value.data!.dataOutputVariable.id) {
      const y = dataOutputVariableRef.value.offsetTop + dataOutputVariableRef.value.clientHeight / 2 + 4
      updateNodePosition(currentNode.value.data!.dataOutputVariable.id, y)
    }
    if(dataFrameOutputVariableRef.value && currentNode.value.data!.dataFrameOutputVariable.id) {
      const y = dataFrameOutputVariableRef.value.offsetTop + dataFrameOutputVariableRef.value.clientHeight / 2 + 4
      updateNodePosition(currentNode.value.data!.dataFrameOutputVariable.id, y)
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
    if (dataOutputVariableRef.value && currentNode.value.data!.dataOutputVariable.id) {
      const y = dataOutputVariableRef.value.offsetTop + dataOutputVariableRef.value.clientHeight / 2 + 4
      updateNodePosition(currentNode.value.data!.dataOutputVariable.id, y)
    }
    if(dataFrameOutputVariableRef.value && currentNode.value.data!.dataFrameOutputVariable.id) {
      const y = dataFrameOutputVariableRef.value.offsetTop + dataFrameOutputVariableRef.value.clientHeight / 2 + 4
      updateNodePosition(currentNode.value.data!.dataFrameOutputVariable.id, y)
    }
  }
}, { immediate: true })

</script>

<template>
    <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">

        <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />
        <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
            <Separator class="my-5" />



            <div ref="urlInputVariableRef">
                <div class="flex flex-row items-center space-x-2">
                    <p>URL<span class="text-red-500">*</span></p>
                    <NuxtIcon name="clarity:info-line" size="20" />
                </div>
                <div class="w-full  mt-5">
                    <EditTextDialog class="w-full" :disabled="currentNode.data.urlInputVariable.connected" :model-value="currentNode.data.urlInputVariable.value || ''" placeholder="请输入地址" @save="(val) => currentNode!.data!.urlInputVariable.value = val" />

                </div>
                <div>以 http/https 开头</div>
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



            <div v-if="currentNode.data.methodType!=='get'" ref="bodyVariableRef">
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

        <div ref="dataOutputVariableRef" class="bg-[#27272A]   py-2 pl-5 pr-10  flex items-center justify-center">
            <div class="w-full h-full   flex items-center  justify-between">
                <NuxtIcon v-if="currentNode.data.dataOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataOutputVariable.show = false" />

                <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataOutputVariable.show = true" />

                <div class="  ">
                    Data
                </div>
            </div>
        </div>
        <div ref="dataFrameOutputVariableRef" class="bg-[#27272A]  -mt-5 py-2 pl-5 pr-10  flex items-center justify-center">
            <div class="w-full h-full   flex items-center  justify-between">
                <NuxtIcon v-if="currentNode.data.dataFrameOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataFrameOutputVariable.show = false" />

                <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataFrameOutputVariable.show = true" />

                <div class="  ">
                    DataFrame
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
</template>
