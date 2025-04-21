<script lang="ts" setup>
import  type {  MessageHistoryData} from '@/types/node-data/message-history'
import  { messageHistoryMeta} from '@/types/node-data/message-history'
import { createPortManager } from '~/components/workflow/useNodePorts'

import { useVueFlow } from '@vue-flow/core'

// const { nodeExecutionTimes } = useNodeExecutionStats()

// 引入公共样式
const props = defineProps({
  id: String

})
const currentNode = ref<{ id: string, data?: MessageHistoryData }>()
const { addInputPort, addOutputPort } = createPortManager()
const { nodes,edges} = storeToRefs(useWorkflowStore())
const memoryInputVariableRef = ref<HTMLElement | null>(null)
const dataOutputVariableRef = ref<HTMLElement | null>(null)
const messageOutputVariableRef = ref<HTMLElement | null>(null)
const dataframeOutputVariableRef = ref<HTMLElement | null>(null)
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ...messageHistoryMeta,
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as MessageHistoryData
  
  currentNode.value = node
  await nextTick() // 等待 DOM 渲染完毕
 
 
  if(memoryInputVariableRef.value && !node.data.saved) {
    const portId= nanoLowercaseAlphanumericId(10)
    currentNode.value.data!.memoryInputVariable.id=portId
    addInputPort(props.id!, portId, 'aquamarine', memoryInputVariableRef.value.offsetTop)
  }

 
  if (dataOutputVariableRef.value && !node.data.saved) {
    const portId = nanoLowercaseAlphanumericId(10)
    currentNode.value.data!.dataOutputVariable.id=portId
    addOutputPort(props.id!, portId, 'pink',dataOutputVariableRef.value.offsetTop + dataOutputVariableRef.value.clientHeight / 2)
  }

    if (messageOutputVariableRef.value && !node.data.saved) {
        const portId = nanoLowercaseAlphanumericId(10)
        currentNode.value.data!.messageOutputVariable.id=portId
        addOutputPort(props.id!, portId, 'pink',messageOutputVariableRef.value.offsetTop + messageOutputVariableRef.value.clientHeight / 2)
    }

    if (dataframeOutputVariableRef.value && !node.data.saved) {
        const portId = nanoLowercaseAlphanumericId(10)
        currentNode.value.data!.dataframeOutputVariable.id=portId
        addOutputPort(props.id!, portId, 'pink',dataframeOutputVariableRef.value.offsetTop + dataframeOutputVariableRef.value.clientHeight / 2)
    }

})

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})
 
 
watch(edges, () => {
  
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.memoryInputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.memoryInputVariable.id)
  
}, { deep: true, immediate: true })

</script>

<template>

  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]">
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
    

    <CardContent class="text-white flex flex-col space-y-8 -mt-8 flex-1 ">
      <Separator class="my-5" />
      

        
      <div ref="memoryInputVariableRef">
        <div  class="  flex w-full flex-row items-center space-x-2">
          <p>Memory</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <p class="text-[#D1D5DB] text-sm">Connect an upstream memory module (e.g., Redis Chat Memory) to retrieve conversation history.</p>
       
     
      </div>

    </CardContent>

    <div ref="messageOutputVariableRef" class="bg-[#27272A]  rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.messageOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.messageOutputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.messageOutputVariable.show = true" />

        <div class="">
          Message
        </div>
      </div>
    </div>
    <div ref="dataOutputVariableRef" class="bg-[#27272A]  -mt-5 rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.dataOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataOutputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataOutputVariable.show = true" />


        <div class="">Data</div>
      </div>

    </div>


    <div ref="dataframeOutputVariableRef" class="bg-[#27272A]   -mt-5 rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.dataframeOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataframeOutputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataframeOutputVariable.show = true" />

        <div class="">
          DataFrame
        </div>
      </div>
    </div>
  </Card>


</template>
