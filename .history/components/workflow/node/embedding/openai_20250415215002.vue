<script lang="ts" setup>
import type { OpenAIEmbeddingsData } from '@/types/node-data/openai-embeddings'

import { cn } from '@/lib/utils'
import { openAIEmbeddingsMeta } from '@/types/node-data/openai-embeddings'
import { Slider } from '~/components/ui/slider'
import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
  id: String,

})
// import { promiseTimeout } from '@vueuse/core'
// const { nodeExecutionTimes } = useNodeExecutionStats()
const currentNode = ref<{ id: string, data?: OpenAIEmbeddingsData }>()

const inputRef = ref<HTMLElement | null>(null)
const systemMessageRef = ref<HTMLElement | null>(null)
const openaiAPIKeyRef = ref<HTMLElement | null>(null)
const baseURLKeyRef = ref<HTMLElement | null>(null)
const outputVariableRef = ref<HTMLElement | null>(null)
 

const { addInputPort, addOutputPort } = createPortManager()
const { nodes, edges } = storeToRefs(useWorkflowStore())
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  // 初始化 data
  node.data = {
    ...openAIEmbeddingsMeta,
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as OpenAIEmbeddingsData

  currentNode.value = node

  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port

 
  if (openaiAPIKeyRef.value && !node.data.saved) {
    currentNode.value.data!.apiKeyVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.apiKeyVariable.id, 'aquamarine', openaiAPIKeyRef.value.offsetTop + openaiAPIKeyRef.value.clientHeight / 2)
  }
 

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (outputVariableRef.value && !node.data.saved) {
    currentNode.value.data!.outputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.outputVariable.id, 'pink', outputVariableRef.value.offsetTop + outputVariableRef.value.clientHeight / 2)
  }

 
})

watch(edges, () => {
  console.log('prompt.vue edges', edges.value)
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.inputTextVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.inputTextVariable.id)
  currentNode.value.data.systemMessageVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.systemMessageVariable.id)
  currentNode.value.data.apiKeyVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.apiKeyVariable.id)
}, { deep: true, immediate: true })

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})

 
 
const models = ref([

  { id: 'text-embedding-3-small', name: 'text-embedding-3-small' },
  { id: 'text-embedding-3-large', name: 'text-embedding-3-large' },
  { id: 'text-embedding-ada-002', name: 'text-embedding-ada-002' },
 
])
</script>

<template>
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
     
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
    <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />

   
   

     

      <div class="w-full">
        <div class="flex flex-row items-center space-x-2 w-full">
          <p>Model</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center justify-between  mt-4">
          <Select v-model="currentNode.data.modelName" class="w-full">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a model name" />
            </SelectTrigger>
            <SelectContent class="w-full dark">
              <SelectGroup>
                <SelectItem v-for="model in models" :key="model.id" :value="model.id">
                  {{ model.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div ref="openaiAPIKeyRef">
        <div class="flex flex-row items-center space-x-2">
          <p>OpenAI API Key<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.apiKeyVariable.connected" class="relative">
            <Input class="w-full" type="text" v-model="currentNode.data.apiKeyVariable.value" placeholder="Typing something" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>
      
    </CardContent>

    <div ref="outputVariableRef" class="bg-[#27272A]   py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.outputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = true" />

        <div class="  ">
          Embeddings
        </div>
      </div>
    </div>
    
  </Card>
</template>
