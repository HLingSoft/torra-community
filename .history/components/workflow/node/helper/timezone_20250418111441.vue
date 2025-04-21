<script lang="ts" setup>
import type { TimezoneData } from '@/types/node-data/timezone'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { timezoneMeta } from '@/types/node-data/timezone'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{
  id: string
}>()
// const { nodeExecutionTimes } = useNodeExecutionStats()
// const editMode = ref(false)

const footer = ref<HTMLElement | null>(null)
const currentNode = ref<{ id: string, data?: TimezoneData }>()

const { addOutputPort } = createPortManager()
const { nodes } = storeToRefs(useWorkflowStore())
const { onNodeClick } = useVueFlow()

onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ..._.cloneDeep(timezoneMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as TimezoneData

  currentNode.value = node
 

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
  <!-- flex flex-col gap-6  border  pt-6 shadow-sm rounded-xl   text-card-foreground hover:shadow-lg transition-shadow duration-300 hover:shadow-[rgba(219,219,219,0.66)] -->
  <Card
    v-if="currentNode && currentNode.data"
    class="!pb-0 w-96 text-white bg-[#18181B] rounded-lg group flex flex-col focus:outline-none focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]"
  >
  <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
 

    <CardContent class="text-white flex flex-col space-y-8 -mt-8 flex-1">
      <Separator class="my-5" />
     
    </CardContent>
   
      <div
      ref="footer"
      class="bg-[#27272A] rounded-b-lg py-2 pl-5 pr-10 flex items-center justify-center w-full"
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
