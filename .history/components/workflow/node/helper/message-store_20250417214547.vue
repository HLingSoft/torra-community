<script lang="ts" setup>
import  type {  MessageStoreData} from '@/types/node-data/message-store'
import  {  messageStoreMeta} from '@/types/node-data/message-store'
import { createPortManager } from '~/components/workflow/useNodePorts'

import { useVueFlow } from '@vue-flow/core'

// const { nodeExecutionTimes } = useNodeExecutionStats()

// 引入公共样式
const props = defineProps({
  id: String

})
const currentNode = ref<{ id: string, data?: MessageStoreData }>()
const { addInputPort, addOutputPort } = createPortManager()
const { nodes,edges} = storeToRefs(useWorkflowStore())

const messageInputVariableRef = ref<HTMLElement | null>(null)
const memoryInputVariableRef = ref<HTMLElement | null>(null)
 
const storedMessagesOutputVariableRef = ref<HTMLElement | null>(null)
 
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ..._.clone(messageStoreMeta),
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as MessageStoreData
  
  currentNode.value = node
  await nextTick() // 等待 DOM 渲染完毕
 
 
  if(memoryInputVariableRef.value && !node.data.saved) {
    const portId= nanoLowercaseAlphanumericId(10)
    currentNode.value.data!.memoryInputVariable.id=portId
    addInputPort(props.id!, portId, 'aquamarine', memoryInputVariableRef.value.offsetTop)
  }

    if (messageInputVariableRef.value && !node.data.saved) {
        const portId = nanoLowercaseAlphanumericId(10)
        currentNode.value.data!.messageInputVariable.id=portId
        addInputPort(props.id!, portId, 'aquamarine', messageInputVariableRef.value.offsetTop + messageInputVariableRef.value.clientHeight / 2)
    }

 
 

    if (storedMessagesOutputVariableRef.value && !node.data.saved) {
        const portId = nanoLowercaseAlphanumericId(10)
        currentNode.value.data!.storedMessagesOutputVariable.id=portId
        addOutputPort(props.id!, portId, 'pink',storedMessagesOutputVariableRef.value.offsetTop + storedMessagesOutputVariableRef.value.clientHeight / 2)
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
  currentNode.value.data.messageInputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.messageInputVariable.id)
  
}, { deep: true, immediate: true })


const roles=[
  {
    id:'ai',
    name:'AI',
  },
  {
    id:'user',
    name:'User',
  }
]
</script>

<template>

  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]">
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
    

    <CardContent class="text-white flex flex-col space-y-8 -mt-8 flex-1 ">
      <Separator class="my-5" />
      
      <div ref="messageInputVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Message</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
            <EditTextDialog class="w-full" :disabled="currentNode.data.messageInputVariable.connected" :model-value="currentNode.data.messageInputVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.messageInputVariable.value = val" />
        
        </div>
      </div>

      <div class="w-full">
        <div class="flex flex-row items-center space-x-2 w-full">
          <p>Role</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center justify-between  mt-4">
          <Select v-model="currentNode.data.role" class="w-full">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a model name" />
            </SelectTrigger>
            <SelectContent class="w-full dark">
              <SelectGroup>
                <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

        
      <div ref="memoryInputVariableRef">
        <div  class="  flex w-full flex-row items-center space-x-2">
          <p>Memory</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <p class="text-[#D1D5DB] text-sm">Connect an upstream memory module (e.g., Redis Chat Memory) to retrieve conversation history.</p>
       
     
      </div>

    </CardContent>

    <div ref="storedMessagesOutputVariableRef" class="bg-[#27272A]  rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.storedMessagesOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.storedMessagesOutputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.storedMessagesOutputVariable.show = true" />

        <div class="">
          Message
        </div>
      </div>
    </div>
  
  </Card>


</template>
