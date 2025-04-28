<script lang="ts" setup>
import type { AgentData } from '@/types/node-data/agent'


import { agentMeta } from '@/types/node-data/agent'

import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
  id: String,

})
// import { promiseTimeout } from '@vueuse/core'
// const { nodeExecutionTimes } = useNodeExecutionStats()
const currentNode = ref<{ id: string, data?: AgentData }>()

const inputRef = ref<HTMLElement | null>(null)
const instructionVariableRef = ref<HTMLElement | null>(null)
const openaiAPIKeyRef = ref<HTMLElement | null>(null)
const baseURLRef = ref<HTMLElement | null>(null)
const toolsVariableRef = ref<HTMLElement | null>(null)
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
    ..._.cloneDeep(agentMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as AgentData

  currentNode.value = node

  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port

  // await promiseTimeout(500)
  if (inputRef.value && !node.data.saved) {
    currentNode.value.data!.inputVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.inputVariable.id, 'aquamarine', inputRef.value.offsetTop + inputRef.value.clientHeight / 2)
  }

  if (instructionVariableRef.value && !node.data.saved) {
    currentNode.value.data!.instructionVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.instructionVariable.id, 'aquamarine', instructionVariableRef.value.offsetTop + instructionVariableRef.value.clientHeight / 2)
  }

  if (openaiAPIKeyRef.value && !node.data.saved) {
    currentNode.value.data!.apiKeyVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.apiKeyVariable.id, 'aquamarine', openaiAPIKeyRef.value.offsetTop + openaiAPIKeyRef.value.clientHeight / 2)
  }

  if (baseURLRef.value && !node.data.saved) {
    currentNode.value.data!.baseURLVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.baseURLVariable.id, 'aquamarine', baseURLRef.value.offsetTop + baseURLRef.value.clientHeight / 2)
  }

  if (toolsVariableRef.value && !node.data.saved) {
    currentNode.value.data!.toolsVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.toolsVariable.id, 'orange', toolsVariableRef.value.offsetTop - 10)
  }

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (outputVariableRef.value && !node.data.saved) {
    currentNode.value.data!.outputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.outputVariable.id, 'pink', outputVariableRef.value.offsetTop + outputVariableRef.value.clientHeight / 2)
  }


})

watch(edges, () => {
  //
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.inputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.inputVariable.id)
  currentNode.value.data.instructionVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.instructionVariable.id)
  currentNode.value.data.apiKeyVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.apiKeyVariable.id)
  currentNode.value.data.toolsVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.toolsVariable.id)
}, { deep: true, immediate: true })

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {


})




const llms = ref([

  { id: 'gpt-4o-mini', name: 'gpt-4o-mini' },
  { id: 'gpt-4o', name: 'gpt-4o' },
  { id: 'gpt-4', name: 'gpt-4' },
  { id: 'gpt-4.1', name: 'gpt-4.1' },
])
</script>

<template>
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-background  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-card   focus:border focus: border-card">

    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />
    <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />
      <div class="w-full">
        <div class="flex flex-row items-center space-x-2 w-full">
          <p>Model Name</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center justify-between  mt-4">
          <Select v-model="currentNode.data.modelName" class="w-full">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a model name" />
            </SelectTrigger>
            <SelectContent class="w-full dark">
              <SelectGroup>
                <SelectItem v-for="llm in llms" :key="llm.id" :value="llm.id">
                  {{ llm.name }}
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
          <p>Request Base URL<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <GlobalVariablePopover class="w-full" :disabled="currentNode.data.baseURLVariable.connected" :model-value="currentNode.data.baseURLVariable.value || ''" placeholder="https://api.openai.com/v1" @save="(val) => currentNode!.data!.baseURLVariable.value = val">
          </GlobalVariablePopover>

        </div>

      </div>

      <div ref="instructionVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Agent Instruction</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <EditTextDialog class="w-full" :disabled="currentNode.data.instructionVariable.connected" :model-value="currentNode.data.instructionVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.instructionVariable.value = val" />
        </div>
      </div>
      <div ref="toolsVariableRef">
        <div class="  flex flex-row w-full  items-center space-x-2">
          <p>Tools </p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <p class="text-[#D1D5DB] text-sm"></p>


      </div>

      <div ref="inputRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Input</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <EditTextDialog class="w-full" :disabled="currentNode.data.inputVariable.connected" :model-value="currentNode.data.inputVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.inputVariable.value = val" />

        </div>
      </div>


    </CardContent>

    <div ref="outputVariableRef" class="bg-card   py-2 pl-5 pr-10 rounded-b-lg  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.outputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = true" />

        <div class="  ">
          Message
        </div>
      </div>
    </div>

  </Card>
</template>
