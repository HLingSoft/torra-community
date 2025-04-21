<script lang="ts" setup>
import type { ChatInputData } from '@/types/node-data/chat-input'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { chatInputMeta } from '@/types/node-data/chat-input'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{
  id: string
}>()
const { nodeExecutionTimes } = useNodeExecutionStats()
const editMode = ref(false)

const footer = ref<HTMLElement | null>(null)
const currentNode = ref<{ id: string, data?: ChatInputData }>()

const { addOutputPort } = createPortManager()
const { nodes } = storeToRefs(useWorkflowStore())
const { onNodeClick } = useVueFlow()

onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ...chatInputMeta,
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as ChatInputData

  currentNode.value = node
  console.log('currentNode.value', currentNode.value)

  await nextTick()
  if (footer.value && !node.data.saved) {
    const outputPortId = nanoLowercaseAlphanumericId(10)
    node.data.outputVariable.id = outputPortId
    const offset = footer.value.offsetTop + footer.value.clientHeight / 2
    addOutputPort(props.id, outputPortId, 'pink', offset)
  }
})

onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})
</script>

<template>
  <Card
    v-if="currentNode && currentNode.data"
    class="w-96 text-white bg-[#18181B] rounded-lg group flex flex-col focus:outline-none focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]"
  >
    <CardHeader>
      <CardTitle class="text-white flex flex-row items-center justify-between">
        <div class="flex flex-row space-x-2 items-center">
          <div class="bg-[#27272A] rounded-lg p-1">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="ml-10">
            <Input
              v-if="editMode"
              v-model="currentNode.data.title"
              class="w-60 nodrag nopan"
              type="text"
            />
            <div v-else>
              {{ currentNode.data.title }}
            </div>
          </div>
        </div>

        <div
          class="bg-[#27272A] cursor-pointer transition-all duration-200 rounded-lg p-1"
          :class="editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        >
          <NuxtIcon
            name="iconamoon:edit-light"
            size="20"
            class="text-white"
            @click.stop="editMode = !editMode"
          />
        </div>
      </CardTitle>

      <CardDescription class=" p-2 rounded-lg">
        <Input
          v-if="editMode"
          v-model="currentNode.data. description"
          class="w-full nodrag nopan text-white"
          type="text"
        />
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

    <CardContent class="text-white flex flex-col space-y-8 -mt-8 flex-1">
      <Separator class="my-1" />
      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>Text</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full mt-5">
          <EditTextDialog
            class="w-full"

            :model-value="currentNode.data.inputValue || ''"
            placeholder="请输入文本"
            @save="(val) => currentNode!.data!.inputValue = val"
          />
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <div
      ref="footer"
      class="bg-[#27272A] rounded-b-lg py-2 pl-5 pr-10 flex items-center justify-center w-full"
    >
      <div class="w-full h-full flex items-center justify-between">
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
          Message
        </div>
      </div>
    </div>
    </CardFooter>

    
  </Card>
</template>
