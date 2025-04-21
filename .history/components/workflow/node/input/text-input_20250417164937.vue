<script lang="ts" setup>
import type { TextInputData } from '@/types/node-data/text-input'
// import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { textInputMeta } from '@/types/node-data/text-input'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{
  id: string
}>()
// const { nodeExecutionTimes } = useNodeExecutionStats()
// const title = ref('Chat Input')
// const description = ref('Get chat inputs from the Playground.')
// const editMode = ref(false)

const footer = ref<HTMLElement | null>(null)
const currentNode = ref<{ id: string, data?: TextInputData }>()

const { addOutputPort, addInputPort } = createPortManager()
const { nodes, edges } = storeToRefs(useWorkflowStore())
const { onNodeClick } = useVueFlow()

const inputRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ..._.clone(textInputMeta),
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as TextInputData

  currentNode.value = node

  await nextTick()
  if (inputRef.value && !node.data.saved) {
    currentNode.value.data!.inputVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.inputVariable.id, 'aquamarine', inputRef.value.offsetTop + inputRef.value.clientHeight / 2)
  }
  if (footer.value && !node.data.saved) {
    const offset = footer.value.offsetTop + footer.value.clientHeight / 2
    addOutputPort(props.id, nanoLowercaseAlphanumericId(10), 'pink', offset)
  }
})

onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})

watch(edges, () => {
  // console.log('textinput.vue edges', edges.value)
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.inputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.inputVariable.id)
  // console.log('textinput.vue edges', currentNode.value.data.inputVariable.connected)
}, { deep: true, immediate: true })
</script>

<template>
  <Card
    v-if="currentNode && currentNode.data"
    class="!pb-0 w-96 text-white bg-[#18181B] rounded-lg group flex flex-col focus:outline-none focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]"
  >
    <!-- <CardHeader>
      <CardTitle class="text-white flex flex-row items-center justify-between">
        <div class="flex flex-row space-x-2 items-center">
          <div class="bg-[#27272A] rounded-lg p-1">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="">
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
        <div class="h-5 flex items-center">
          <div v-if="props.id && nodeExecutionTimes[props.id]" class="  text-green-300 font-mono">
            ⏱️ 耗时：{{ nodeExecutionTimes[props.id] }}
          </div>
        </div>
      </CardDescription>
    </CardHeader> -->
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>

    <CardContent class="text-white space-y-8 -mt-8 flex-1">
      <Separator class="my-5" />
      <div ref="inputRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Text</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full mt-5">
          <EditTextDialog
            class="w-full"
            :disabled="currentNode.data.inputVariable.connected"
            :model-value="currentNode.data.inputVariable.value || ''"
            placeholder="请输入文本"
            @save="(val) => currentNode!.data!.inputVariable.value = val"
          />
        </div>
      </div>
    </CardContent>

    <div
      ref="footer"
      class="bg-[#27272A] rounded-b-lg py-2 pl-5 pr-10 flex items-center justify-center"
    >
      <div class="w-full h-full flex items-center justify-between">
        <NuxtIcon
          v-if="currentNode.data.outputVariable.show"
          name="lets-icons:view-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.outputVariable.show = false"
        />
        <NuxtIcon
          v-else
          name="lets-icons:view-hide-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.outputVariable.show = true"
        />
        <div class="">
          Message
        </div>
      </div>
    </div>
  </Card>
</template>
