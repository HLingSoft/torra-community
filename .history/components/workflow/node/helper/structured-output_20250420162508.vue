<script lang="ts" setup>
import type { StructuredOutputData } from '@/types/node-data/structured-output'


import { structuredOutputMeta } from '@/types/node-data/structured-output'

import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
    id: String,

})

type KeyValueSchema = Record<
  string,
  {
    description: string
    type: string
  }
>

const currentNode = ref<{ id: string, data?: StructuredOutputData }>()


const languageModelVariableRef = ref<HTMLElement | null>(null)
const inputMessageVariableRef = ref<HTMLElement | null>(null)

const structuredOutputVariableRef = ref<HTMLElement | null>(null)
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
        ..._.cloneDeep(structuredOutputMeta),
        ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
    } as StructuredOutputData

    currentNode.value = node

    await nextTick() // 等待 DOM 渲染完毕
    // ✅ 给每个字段位置添加 Input Port


    if (languageModelVariableRef.value && !node.data.saved) {
        currentNode.value.data!.languageModelVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value!.data!.languageModelVariable.id, 'aquamarine', languageModelVariableRef.value.offsetTop-10)
    }
    if (inputMessageVariableRef.value && !node.data.saved) {
        currentNode.value.data!.inputMessageVariable.id = nanoLowercaseAlphanumericId(10)
        addInputPort(props.id!, currentNode.value.data!.inputMessageVariable.id, 'aquamarine', inputMessageVariableRef.value.offsetTop + inputMessageVariableRef.value.clientHeight / 2)
    }


 
    if (structuredOutputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.structuredOutputVariable.id = nanoLowercaseAlphanumericId(10)
        addOutputPort(props.id!, currentNode.value.data!.structuredOutputVariable.id, 'pink', structuredOutputVariableRef.value.offsetTop + structuredOutputVariableRef.value.clientHeight / 2)
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


    currentNode.value.data.languageModelVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.languageModelVariable.id)
    currentNode.value.data.inputMessageVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.inputMessageVariable.id)
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

const outputSchemaIsOpen = ref(false)
const outputSchemaClonedData = ref<KeyValueSchema>({})
const saveoutputSchema = () => {
    if (!currentNode.value) {
        return
    }
    currentNode.value.data!.outputSchema.value = outputSchemaClonedData.value
    outputSchemaIsOpen.value = false
}
watch(outputSchemaIsOpen, (val) => {
    if (val) {
        outputSchemaClonedData.value = currentNode.value?.data?.outputSchema.value || []
    } else {
        outputSchemaClonedData.value = {}
    }
}, { immediate: true })



</script>

<template>
    <div>
    <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">

        <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />
        <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
            <Separator class="my-5" />



            <div ref="languageModelVariableRef">
                <div class="flex flex-row items-center space-x-2">
                    <p>Language Model<span class="text-red-500">*</span></p>
                    <NuxtIcon name="clarity:info-line" size="20" />
                </div>
               
               
            </div>

            <div ref="inputMessageVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Input Message</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <EditTextDialog class="w-full" :disabled="currentNode.data.inputMessageVariable.connected" :model-value="currentNode.data.inputMessageVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.inputMessageVariable.value = val" />
        </div>
      </div>
            


            <div  >
                <div class="flex flex-row items-center space-x-2">
                    <p>Output Schema<span class="text-red-500">*</span></p>
                    <NuxtIcon name="clarity:info-line" size="20" />
                </div>
                <div class="w-full  mt-5">
                    <Button :disabled="currentNode.data.outputSchema.connected" variant="outline" class="w-full" @click.stop="outputSchemaIsOpen = true">
                        <NuxtIcon name="mdi-light:table" size="20" />
                        Open Table
                    </Button>
                </div>
            </div>


        </CardContent>

        <div ref="structuredOutputVariableRef" class="bg-[#27272A]   py-2 pl-5 pr-10  flex items-center justify-center">
            <div class="w-full h-full   flex items-center  justify-between">
                <NuxtIcon v-if="currentNode.data.structuredOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.structuredOutputVariable.show = false" />

                <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.structuredOutputVariable.show = true" />

                <div class="  ">
                    Structured  Data
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

    <Dialog v-model:open="outputSchemaIsOpen">
        <DialogContent class="dark  flex flex-col text-white w-full !max-w-7xl h-[80vh]">
            <DialogHeader class="shrink-0">
                <DialogTitle>
                    <div class="flex flex-row items-center space-x-2">
                        <NuxtIcon name="mdi-light:table" size="20" />
                      Output Schema
                    </div>
                </DialogTitle>
                <DialogDescription>
                    Define the structure and data types for the model's output.
                </DialogDescription>
            </DialogHeader>
            <div class="flex-1 overflow-auto">
                <FunctionCallSchemaEditor
                    
                   v-model="outputSchemaClonedData" />
             
            </div>

            <DialogFooter class="w-full shrink-0 flex flex-row items-center justify-between">

                <Button @click="saveoutputSchema">
                    Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</div>
</template>
