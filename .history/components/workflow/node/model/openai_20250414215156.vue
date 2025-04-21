<script lang="ts" setup>
import type { ChatOpenAIData } from '@/types/node-data/chat-openai'

import { cn } from '@/lib/utils'
import { chatOpenAIMeta } from '@/types/node-data/chat-openai'
import { Slider } from '~/components/ui/slider'
import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
  id: String,

})
// import { promiseTimeout } from '@vueuse/core'
const { nodeExecutionTimes } = useNodeExecutionStats()
const currentNode = ref<{ id: string, data?: ChatOpenAIData }>()

const inputRef = ref<HTMLElement | null>(null)
const systemMessageRef = ref<HTMLElement | null>(null)
const openaiAPIKeyRef = ref<HTMLElement | null>(null)
const baseURLKeyRef = ref<HTMLElement | null>(null)
const messageRef = ref<HTMLElement | null>(null)
const languageModelRef = ref<HTMLElement | null>(null)

const { addInputPort, addOutputPort } = createPortManager()
const { nodes, edges } = storeToRefs(useWorkflowStore())
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  // 初始化 data
  node.data = {
    ...chatOpenAIMeta,
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as ChatOpenAIData

  currentNode.value = node

  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port

  // await promiseTimeout(500)
  if (inputRef.value && !node.data.saved) {
    currentNode.value.data!.inputTextVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.inputTextVariable.id, 'aquamarine', inputRef.value.offsetTop + inputRef.value.clientHeight / 2)
  }

  if (systemMessageRef.value && !node.data.saved) {
    currentNode.value.data!.systemMessageVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.systemMessageVariable.id, 'aquamarine', systemMessageRef.value.offsetTop + systemMessageRef.value.clientHeight / 2)
  }

  if (openaiAPIKeyRef.value && !node.data.saved) {
    currentNode.value.data!.apiKeyVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.apiKeyVariable.id, 'aquamarine', openaiAPIKeyRef.value.offsetTop + openaiAPIKeyRef.value.clientHeight / 2)
  }

  if (baseURLKeyRef.value && !node.data.saved) {
    currentNode.value.data!.baseURLVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.baseURLVariable.id, 'aquamarine', baseURLKeyRef.value.offsetTop + baseURLKeyRef.value.clientHeight / 2)
  }

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (messageRef.value && !node.data.saved) {
    currentNode.value.data!.messageOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.messageOutputVariable.id, 'pink', messageRef.value.offsetTop + messageRef.value.clientHeight / 2)
  }

  if (languageModelRef.value && !node.data.saved) {
    currentNode.value.data!.languageModelOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.languageModelOutputVariable.id, 'pink', languageModelRef.value.offsetTop + languageModelRef.value.clientHeight / 2)
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

const editMode = ref(false)

const temperatureArray = computed<number[]>({
  get: () => [currentNode.value?.data?.temperature ?? 0.2],
  set: (val) => {
    if (currentNode.value?.data) {
      currentNode.value.data.temperature = val[0]
    }
  },
})
const llms = ref([

  { id: 'gpt-4o-mini', name: 'gpt-4o-mini' },
  { id: 'gpt-4o', name: 'gpt-4o' },
  { id: 'gpt-4', name: 'gpt-4' },
  { id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo' },
])
</script>

<template>
  <Card v-if=" currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
    <CardHeader class="group">
      <CardTitle class="text-white  flex flex-row  items-center justify-between">
        <div class="flex drag-header flex-row space-x-2 items-center">
          <div class="bg-[#27272A] rounded-lg p-1  ">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="">
            <Input v-if="editMode" v-model="currentNode.data.title" class="w-60 nodrag nopan" type="text" />
            <div v-else>
              {{ currentNode.data.title }}
            </div>
          </div>
        </div>
        <div
          class="bg-[#27272A] cursor-pointer transition-all duration-200 rounded-lg p-1" :class="[
            editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          ]"
        >
          <NuxtIcon name="iconamoon:edit-light" size="20" class="text-white" @click.stop="editMode = !editMode" />
        </div>
      </CardTitle>

      <CardDescription class="   p-2 rounded-lg">
        <Input v-if="editMode" v-model="currentNode.data.description" class="w-full nodrag nopan text-white" type="text" placeholder="" />
        <div v-else class="text-[#D1D5DB]">
          {{ currentNode.data.description }}
        </div>
        <div class="h-10 flex items-center">
          <div v-if="props.id && nodeExecutionTimes[props.id]" class="  text-green-300 font-mono">
            ⏱️ 耗时：{{ nodeExecutionTimes[props.id] }}
          </div>
        </div>
      </CardDescription>
    </CardHeader>

    <CardContent class="text-white  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />

      <div ref="inputRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Input</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.inputTextVariable.connected " class="relative">
            <Input v-model="currentNode.data.inputTextVariable.value" class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>

      <div ref="systemMessageRef">
        <div class="flex flex-row items-center space-x-2">
          <p>System Message</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <EditTextDialog
            class="w-full"
            :disabled="currentNode.data.systemMessageVariable.connected"
            :model-value="currentNode.data.systemMessageVariable.value || ''"
            placeholder="Typing something"
            @save="(val) => currentNode!.data!.systemMessageVariable.value = val"
          />
        </div>
      </div>

      <div class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
        <div class="flex flex-row items-center space-x-2">
          <p>Stream</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>

        <Switch
          v-model="currentNode.data.streaming"
        />
      </div>

      <div>
        <div class="flex flex-row items-center space-x-2 w-full">
          <p>Model Name</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center justify-between  mt-4">
          <Select v-model="currentNode.data.modelName" class="w-full  ">
            <SelectTrigger>
              <SelectValue placeholder="Select a model name" />
            </SelectTrigger>
            <SelectContent class="dark w-full   ">
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
          <div v-if="!currentNode.data.apiKeyVariable.connected" class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>
      <div ref="baseURLKeyRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Request Base URL<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <EditTextDialog
            class="w-full"
            :model-value="currentNode.data.baseURLVariable.value || ''"
            placeholder="https://api.openai.com/v1/chat/completions"
            @save="(val) => currentNode!.data!.baseURLVariable.value = val"
          />
        </div>
      </div>
      <div>
        <div class="flex flex-row items-center justify-between space-x-2">
          <div class="flex flex-row items-center space-x-2">
            <p>Temperature</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="font-mono ">
            {{ currentNode.data.temperature }}
          </div>
        </div>
        <div class="w-full  mt-5">
          <Slider
            v-model="temperatureArray"
            :max="1"
            :min="0"
            :step="0.1"
            :class="cn('w-full cursor-pointer', $attrs.class ?? '')"
          />
          <div class="flex text-muted-foreground text-xs mt-3 justify-between">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
      </div>
    </CardContent>

    <div ref="messageRef" class="bg-[#27272A]   py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon
          v-if="currentNode.data.show"
          name="lets-icons:view-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.show = false"
        />

        <NuxtIcon
          v-else
          name="lets-icons:view-hide-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.show = true"
        />

        <div class="  ">
          Message
        </div>
      </div>
    </div>
    <div ref="languageModelRef" class="bg-[#27272A]   mt-2 rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon
          v-if="currentNode.data.show"
          name="lets-icons:view-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.show = false"
        />

        <NuxtIcon
          v-else
          name="lets-icons:view-hide-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.show = true"
        />

        <div class="">
          Language Model
        </div>
      </div>
    </div>
  </Card>
</template>
