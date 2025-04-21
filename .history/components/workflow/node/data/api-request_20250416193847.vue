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

const { addInputPort, addOutputPort } = createPortManager()
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
 

  // ✅ 添加输出端口，通常靠底部（Message 区域）
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
</script>

<template>
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
     
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
    <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />

   
   
      <div ref="urlInputVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>URL<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
            <EditTextDialog class="w-full" :disabled="currentNode.data.urlInputVariable.connected" :model-value="currentNode.data.urlInputVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.urlInputVariable.value = val" />
        
        </div>
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


     
      <div ref="bodyVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Body<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
            <Button variant="outline" class="w-full">
                <NuxtIcon name="lucide:plus" size="20" class="mr-2" />
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
      <DialogContent class="dark text-white w-full max-w-7xl ">
        <DialogHeader>
          <DialogTitle>Edit text content</DialogTitle>
          <DialogDescription>
            Edit text content.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Textarea
            v-model="currentEditVariable!.value"
            class="w-full h-[60vh] resize-none"
            placeholder="Typing..."
          />
        </div>
        <DialogFooter class="w-full flex flex-row items-center justify-between">
          <Button @click="saveEditVariableTextValue">
            Finish Editing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
</template>
