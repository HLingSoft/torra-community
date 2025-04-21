<script lang="ts" setup>
import type { RedisChatMemoryData } from '@/types/node-data/memory-redis'

 
import { redisChatMemoryMeta } from '@/types/node-data/memory-redis'

import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
  id: String,

})
 
const currentNode = ref<{ id: string, data?: RedisChatMemoryData }>()

 
const tokenVariableRef = ref<HTMLElement | null>(null)
const urlRef = ref<HTMLElement | null>(null)
const memoryOutputVariableRef = ref<HTMLElement | null>(null)
 

const { addInputPort, addOutputPort } = createPortManager()
const { nodes, edges,currentWorkflow } = storeToRefs(useWorkflowStore())
onMounted(async () => {
  await until(currentWorkflow).toBeTruthy()
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  // 初始化 data
  node.data = {
    ...redisChatMemoryMeta,
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as RedisChatMemoryData

  currentNode.value = node

  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port

  if(!node.data.saved){
    node.data.sessionId =currentWorkflow.value.objectId
  }
 
  if (tokenVariableRef.value && !node.data.saved) {
    currentNode.value.data!.tokenVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.tokenVariable.id, 'aquamarine', tokenVariableRef.value.offsetTop + tokenVariableRef.value.clientHeight / 2)
  }

   
  if (urlRef.value && !node.data.saved) {
    currentNode.value.data!.urlVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.urlVariable.id, 'aquamarine', urlRef.value.offsetTop + urlRef.value.clientHeight / 2)
  }
 

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (memoryOutputVariableRef.value && !node.data.saved) {
    currentNode.value.data!.memoryOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.memoryOutputVariable.id, 'pink', memoryOutputVariableRef.value.offsetTop + memoryOutputVariableRef.value.clientHeight / 2)
  }

 
})

watch(edges, () => {
  console.log('prompt.vue edges', edges.value)
  if (!currentNode.value?.data) {
    return
  }

  
  currentNode.value.data.tokenVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.tokenVariable.id)
    currentNode.value.data.urlVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.urlVariable.id)
}, { deep: true, immediate: true })

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})

 
 
</script>

<template>
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
     
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
    <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />

   
   

     
 
      <div ref="tokenVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Upstash Redis URL<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <GlobalVariablePopover
          class="w-full"
          :disabled="currentNode.data.urlVariable.connected"
          :model-value="currentNode.data.urlVariable.value || ''"
          
          placeholder="Typing something"
          @save="(val) => currentNode!.data!.urlVariable.value = val" >
          </GlobalVariablePopover>
        </div>
      </div>

      <div ref="urlRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Upstash Redis Token</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <GlobalVariablePopover
          class="w-full"
          :disabled="currentNode.data.tokenVariable.connected"
          :model-value="currentNode.data.tokenVariable.value || ''"
          
          placeholder="Typing something"
          @save="(val) => currentNode!.data!.tokenVariable.value = val" >
          </GlobalVariablePopover>
        </div>
      </div>

      
    </CardContent>

    <div ref="memoryOutputVariableRef" class="bg-[#27272A]   py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.memoryOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.memoryOutputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.memoryOutputVariable.show = true" />

        <div class="  ">
          Memory 
        </div>
      </div>
    </div>
    
  </Card>
</template>
