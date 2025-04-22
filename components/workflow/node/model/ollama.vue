<script lang="ts" setup>
import { cn } from '@/lib/utils'
import { Slider } from '~/components/ui/slider'
import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'

//  import { Handle,Position } from '@vue-flow/core'

// 引入公共样式
const props = defineProps({
  id: String,

})
const currentNode = ref()
const baseUrlRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLElement | null>(null)
const systemMessageRef = ref<HTMLElement | null>(null)

const messageRef = ref<HTMLElement | null>(null)
const languageModelRef = ref<HTMLElement | null>(null)
const { addInputPort, addOutputPort } = createPortManager()
const { nodes } = storeToRefs(useWorkflowStore())
onMounted(async () => {
  currentNode.value = nodes.value.find(node => node.id === props.id)
  // console.log('currentNode', currentNode.value)
  // await nextTick() // 等待 DOM 渲染完毕
  // addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', 25)
  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port
  if (baseUrlRef.value) {
    addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', baseUrlRef.value.offsetTop + baseUrlRef.value.clientHeight / 2 + 16)
  }

  if (inputRef.value) {
    addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', inputRef.value.offsetTop + inputRef.value.clientHeight / 2 + 16)
  }

  if (systemMessageRef.value) {
    addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', systemMessageRef.value.offsetTop + systemMessageRef.value.clientHeight / 2 + 16)
  }

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (messageRef.value) {
    addOutputPort(props.id!, nanoLowercaseAlphanumericId(10), 'pink', messageRef.value.offsetTop + messageRef.value.clientHeight / 2 + 4)
  }

  if (languageModelRef.value) {
    addOutputPort(props.id!, nanoLowercaseAlphanumericId(10), 'pink', languageModelRef.value.offsetTop + languageModelRef.value.clientHeight / 2 + 4)
  }
})

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {


})

const editMode = ref(false)
const title = ref('Ollama')
const description = ref('Generate text using Ollama Local LLMs.')

const temperature = ref([0.2])
const toolEnabled = ref(false)
const handleToolEnabledChange = (value: boolean) => {
  toolEnabled.value = value
  console.log('Tool Model Enabled:', value)
}
const stream = ref(false)
const handleStreamChange = (value: boolean) => {
  stream.value = value
  console.log('Stream:', value)
}
</script>

<template>
  <Card v-if="currentNode" class=" w-96 text-white bg-background text-sm rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-card   focus:border focus: border-card">
    <CardHeader class="">
      <CardTitle class="text-white flex flex-row  items-center justify-between">
        <div class="flex drag-header flex-row space-x-2 items-center">
          <div class="bg-card rounded-lg p-1  ">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="ml-10">
            <Input v-if="editMode" v-model="title" class="w-60 nodrag nopan" type="text" />
            <div v-else>
              {{ title }}
            </div>
          </div>
        </div>
        <div class="bg-card cursor-pointer transition-all duration-200 rounded-lg p-1" :class="[
          editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        ]">
          <NuxtIcon name="iconamoon:edit-light" size="20" class="text-white" @click.stop="editMode = !editMode" />
        </div>
      </CardTitle>

      <CardDescription class=" mt-3  p-2 rounded-lg">
        <Input v-if="editMode" v-model="description" class="w-full nodrag nopan text-white" type="text" placeholder="" />
        <div v-else class="text-[#D1D5DB]">
          {{ description }}
        </div>
      </CardDescription>
    </CardHeader>

    <CardContent class="text-white space-y-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />
      <div ref="baseUrlRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Base Url</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="请输入URL" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>Model Name</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center justify-between  mt-5">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a model name" />
            </SelectTrigger>
            <SelectContent class="dark">
              <SelectGroup>
                <!-- <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">
                  Apple
                </SelectItem> -->
              </SelectGroup>
            </SelectContent>
          </Select>
          <div class="bg-card rounded-lg p-1 ml-4 flex items-center justify-center">
            <NuxtIcon name="solar:refresh-bold-duotone" size="20" class=" cursor-pointer" />
          </div>
        </div>
      </div>

      <div>
        <div class="flex flex-row items-center justify-between space-x-2">
          <div class="flex flex-row items-center space-x-2">
            <p>Temperature</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="font-mono ">
            {{ temperature[0] }}
          </div>
        </div>
        <div class="w-full  mt-5">
          <Slider v-model="temperature" :max="1" :min="0" :step="0.1" :class="cn('w-full', $attrs.class ?? '')" />
          <div class="flex text-muted-foreground text-xs mt-3 justify-between">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
      </div>

      <div class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
        <div class="flex flex-row items-center space-x-2">
          <p>Tool Model Enabled</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>

        <Switch :model-value="toolEnabled" @update:model-value="handleToolEnabledChange" />
      </div>

      <div ref="inputRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Input</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div ref="systemMessageRef">
        <div class="flex flex-row items-center space-x-2">
          <p>System Message</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:full-screen-broken" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
        <div class="flex flex-row items-center space-x-2">
          <p>Stream</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>

        <Switch :model-value="stream" @update:model-value="handleStreamChange" />
      </div>
    </CardContent>

    <div ref="messageRef" class="bg-card    py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.show = true" />

        <div class="text-sm  ">
          Message
        </div>
      </div>
    </div>
    <div ref="languageModelRef" class="bg-card   mt-2 rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.show = true" />

        <div class="text-sm">
          Language Model
        </div>
      </div>
    </div>
  </Card>
</template>
