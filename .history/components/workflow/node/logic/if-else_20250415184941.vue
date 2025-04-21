<script lang="ts" setup>
import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
import type { IfElseData } from '@/types/node-data/if-else'
 import { ifElseMeta } from '@/types/node-data/if-else'
// 引入公共样式
const props = defineProps({
  id: String,

})
const { nodes, edges } = storeToRefs(useWorkflowStore())
const currentNode =ref<{ id: string, data?: IfElseData }>()
const textInputRef = ref<HTMLElement | null>(null)
const messageRef = ref<HTMLElement | null>(null)
const matchTextRef = ref<HTMLElement | null>(null)

const trueRef = ref<HTMLElement | null>(null)
const falseRef = ref<HTMLElement | null>(null)
const { addInputPort, addOutputPort } = createPortManager()
 
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  // 初始化 data
  node.data = {
    ...ifElseMeta,
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as IfElseData

  currentNode.value = node
  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port
 
  if (textInputRef.value && !node.data.saved) {
    currentNode.value.data!.textInputVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.textInputVariable.id, 'aquamarine', textInputRef.value.offsetTop + textInputRef.value.clientHeight / 2)
  }

  if (messageRef.value && !node.data.saved) {
    currentNode.value.data!.messageVariable.id = nanoLowercaseAlphanumericId(10)  
    addInputPort(props.id!,   currentNode.value.data!.messageVariable.id , 'aquamarine', messageRef.value.offsetTop + messageRef.value.clientHeight / 2 - 10)
  }

  if (matchTextRef.value) {
    currentNode.value.data!.matchTextVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.matchTextVariable.id, 'aquamarine', matchTextRef.value.offsetTop + matchTextRef.value.clientHeight / 2 - 10)
  }

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (trueRef.value) {
    currentNode.value.data!.trueOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.trueOutputVariable.id , 'pink', trueRef.value.offsetTop + trueRef.value.clientHeight / 2)
  }

  if (falseRef.value) {
    currentNode.value.data!.falseOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.falseOutputVariable.id, 'pink', falseRef.value.offsetTop + falseRef.value.clientHeight / 2)
  }
})

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})

const editMode = ref(false)
 

 

// const operator = ref('equals')
const allOperator = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'matches', label: 'Matches' },
  { value: 'isEmpty', label: 'Is Empty' },
  { value: 'isNotEmpty', label: 'Is Not Empty' },
  { value: 'isNull', label: 'Is Null' },
  { value: 'isNotNull', label: 'Is Not Null' },
  { value: 'isTrue', label: 'Is True' },
  { value: 'isFalse', label: 'Is False' },
]

watch(edges, () => {
  console.log('prompt.vue edges', edges.value)
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.textInputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.textInputVariable.id)
  currentNode.value.data.matchTextVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.matchTextVariable.id)
  currentNode.value.data.messageVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.messageVariable.id)
}, { deep: true, immediate: true })
</script>

<template>
  <Card v-if=" currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]   rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
    <CardHeader class="">
      <CardTitle class="text-white flex flex-row  items-center justify-between">
        <div class="flex drag-header flex-row space-x-2 items-center">
          <div class="bg-[#27272A] rounded-lg p-1  ">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="ml-10">
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

      <CardDescription class=" mt-3  p-2 rounded-lg">
        <Textarea v-if="editMode" v-model="currentNode.data.description" class="w-full nodrag nopan text-white" type="text" placeholder="" />
        <div v-else class="text-[#D1D5DB]">
          {{ currentNode.data.description }}
        </div>
      </CardDescription>
    </CardHeader>

    <CardContent class="text-white space-y-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />
      <div ref="textInputRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Text Input<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div ref="matchTextRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Match Text<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>
      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>Operator<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center    mt-5">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a operator" />
            </SelectTrigger>
            <SelectContent class="dark">
              <SelectGroup>
                <SelectItem v-for="item in allOperator" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
        <div class="flex flex-row items-center space-x-2">
          <p>Case Sensitive</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>

        <Switch
          v-model="currentNode.data!.caseSensitive"
        />
      </div>

      <div ref="messageRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Message</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>
    </CardContent>

    <div ref="trueRef" class="bg-[#27272A]    py-2 pl-5 pr-10  flex items-center justify-center">
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

        <div class="   ">
          True
        </div>
      </div>
    </div>
    <div ref="falseRef" class="bg-[#27272A]    rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
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

        <div class=" ">
          False
        </div>
      </div>
    </div>
  </Card>
</template>
