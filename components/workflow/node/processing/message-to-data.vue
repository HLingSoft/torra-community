<script lang="ts" setup>
import type { MessageToDataData } from '@/types/node-data/message-to-data'
// import type { InputPortVariable, OutputPortVariable } from '~/types/workflow'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { messageToDataMeta } from '@/types/node-data/message-to-data'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{
  id: string
}>()
 
const footer = ref<HTMLElement | null>(null)
const currentNode = ref<{ id: string, data?: MessageToDataData }>()

const { addOutputPort, addInputPort } = createPortManager()
const { nodes, edges } = storeToRefs(useWorkflowStore())
const { onNodeClick } = useVueFlow()

const inputRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  console.log('message-to-data mounted')
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ..._.cloneDeep(messageToDataMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as MessageToDataData

  currentNode.value = node

  await nextTick() // 等待 DOM 渲染完毕
  
  if (inputRef.value && !node.data.saved) {
    currentNode.value.data!.inputVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.inputVariable.id, 'aquamarine', inputRef.value.offsetTop + inputRef.value.clientHeight / 2)
  }
  if (footer.value && !node.data.saved) {
    const offset = footer.value.offsetTop + footer.value.clientHeight / 2
    currentNode.value.data!.outputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id,  currentNode.value.data!.outputVariable.id, 'pink', offset)
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
  <div>
  <Card
    v-if="currentNode && currentNode.data"
    class="!pb-0 w-96 text-white bg-[#18181B] rounded-lg group flex flex-col focus:outline-none focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]"
  >
    
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>

    <CardContent class="text-white space-y-8 -mt-8 flex-1">
      <Separator class="my-5" />
      <div ref="inputRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Message</p>
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
          Data
        </div>
      </div>
    </div>
  </Card>
</div>
</template>
