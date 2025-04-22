<script lang="ts" setup>
import type { OpenAIEmbeddingsData } from '@/types/node-data/openai-embeddings'

 
import { openAIEmbeddingsMeta } from '@/types/node-data/openai-embeddings'
 
import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
  id: String,

})
 
const currentNode = ref<{ id: string, data?: OpenAIEmbeddingsData }>()

 
const openaiAPIKeyRef = ref<HTMLElement | null>(null)
  const baseURLRef = ref<HTMLElement | null>(null)
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
    ..._.cloneDeep(openAIEmbeddingsMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as OpenAIEmbeddingsData

  currentNode.value = node

  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port

 
  if (openaiAPIKeyRef.value && !node.data.saved) {
    currentNode.value.data!.apiKeyVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.apiKeyVariable.id, 'aquamarine', openaiAPIKeyRef.value.offsetTop + openaiAPIKeyRef.value.clientHeight / 2)
  }

   
  if (baseURLRef.value && !node.data.saved) {
    currentNode.value.data!.baseURLVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.baseURLVariable.id, 'aquamarine', baseURLRef.value.offsetTop + baseURLRef.value.clientHeight / 2)
  }
 

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (outputVariableRef.value && !node.data.saved) {
    currentNode.value.data!.outputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.outputVariable.id, 'pink', outputVariableRef.value.offsetTop + outputVariableRef.value.clientHeight / 2)
  }

 
})

watch(edges, () => {
 
  if (!currentNode.value?.data) {
    return
  }

  
  currentNode.value.data.apiKeyVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.apiKeyVariable.id)
}, { deep: true, immediate: true })

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {


})



const models = ref([

  { id: 'text-embedding-3-small', name: 'text-embedding-3-small' },
  { id: 'text-embedding-3-large', name: 'text-embedding-3-large' },
  { id: 'text-embedding-ada-002', name: 'text-embedding-ada-002' },

])
</script>

<template>
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-background  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-card   focus:border focus: border-card">

    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />
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
          <GlobalVariablePopover class="w-full" :disabled="currentNode.data.apiKeyVariable.connected" :model-value="currentNode.data.apiKeyVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.apiKeyVariable.value = val">
          </GlobalVariablePopover>
        </div>
      </div>

      <div ref="baseURLRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Base Url</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <GlobalVariablePopover class="w-full" :disabled="currentNode.data.baseURLVariable.connected" :model-value="currentNode.data.baseURLVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.baseURLVariable.value = val">
          </GlobalVariablePopover>
        </div>
      </div>


    </CardContent>

    <div ref="outputVariableRef" class="bg-card   py-2 pl-5 pr-10  flex items-center justify-center">
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
