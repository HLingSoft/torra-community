<script lang="ts" setup>
import type { APIInputData} from '@/types/node-data/api-input'


import { apiInputMeta } from '@/types/node-data/api-input'

import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
    id: String,

})

type KeyValueSchema = Record<
  string,
  {
      name: string
      description: string
      type: string
  }
>

const currentNode = ref<{ id: string, data?: APIInputData }>()
 

const structuredOutputVariableRef = ref<HTMLElement | null>(null)
 

const {  addOutputPort } = createPortManager()
const { nodes } = storeToRefs(useWorkflowStore())
onMounted(async () => {
    const node = nodes.value.find(node => node.id === props.id)
    if (!node) {
        return
    }

    // 初始化 data
    node.data = {
        ..._.cloneDeep(apiInputMeta),
        ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
    } as APIInputData

    currentNode.value = node

    await nextTick() // 等待 DOM 渲染完毕
    // ✅ 给每个字段位置添加 Input Port

 


    if (structuredOutputVariableRef.value && !node.data.saved) {
        currentNode.value.data!.structuredOutputVariable.id = nanoLowercaseAlphanumericId(10)
        addOutputPort(props.id!, currentNode.value.data!.structuredOutputVariable.id, 'pink', structuredOutputVariableRef.value.offsetTop + structuredOutputVariableRef.value.clientHeight / 2)
    }

   


})


 

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
    
    
})




const inputValueIsOpen = ref(false)
const inputValueClonedData = ref<KeyValueSchema>({})
const saveInputData = () => {
    if (!currentNode.value) {
        return
    }
    console.log('inputValueClonedData.value', inputValueClonedData.value)
    currentNode.value.data!.inputValue= inputValueClonedData.value
    inputValueIsOpen.value = false
}
watch(inputValueIsOpen, (val) => {
    if (val) {
        inputValueClonedData.value = currentNode.value?.data?.inputValue || {}
    } else {
        inputValueClonedData.value = {}
    }
}, { immediate: true })



</script>

<template>
    <div>
        <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-background  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-card   focus:border focus: border-card">

            <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />
            <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
                <Separator class="my-5" />



            



                <div>
                    <div class="flex flex-row items-center space-x-2">
                        <p>Input Schema<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <Button   variant="outline" class="w-full" @click.stop="inputValueIsOpen = true">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Open Table
                        </Button>
                    </div>
                </div>


            </CardContent>

            <div ref="structuredOutputVariableRef" class="bg-card   py-2 pl-5 pr-10  flex items-center justify-center">
                <div class="w-full h-full   flex items-center  justify-between">
                    <NuxtIcon v-if="currentNode.data.structuredOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.structuredOutputVariable.show = false" />

                    <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.structuredOutputVariable.show = true" />

                    <div class="  ">
                        Structured Data
                    </div>
                </div>
            </div>
          
        </Card>

        <Dialog v-model:open="inputValueIsOpen">
            <DialogContent class="dark  flex flex-col text-white w-full !max-w-7xl h-[80vh]">
                <DialogHeader class="shrink-0">
                    <DialogTitle>
                        <div class="flex flex-row items-center space-x-2">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Input Schema
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Define the structure and data types of the API input parameters.
                    </DialogDescription>
                </DialogHeader>
                <div class="flex-1 overflow-auto">
                    <FunctionCallSchemaEditor v-model="inputValueClonedData" />

                </div>

                <DialogFooter class="w-full shrink-0 flex flex-row items-center justify-between">

                    <Button @click="saveInputData">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
