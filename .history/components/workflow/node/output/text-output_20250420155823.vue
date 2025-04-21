<script lang="ts" setup>
import  { textOutputMeta } from '@/types/node-data/text-output'
import type { TextOutputData} from '@/types/node-data/text-output'
import { createPortManager } from '~/components/workflow/useNodePorts'

import { useVueFlow } from '@vue-flow/core'

// const { nodeExecutionTimes } = useNodeExecutionStats()

// 引入公共样式
const props = defineProps({
  id: String

})
const currentNode = ref<{ id: string, data?: TextOutputData }>()
const { addInputPort, addOutputPort } = createPortManager()
const { nodes,edges} = storeToRefs(useWorkflowStore())
const inputRef = ref<HTMLElement | null>(null)
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ..._.cloneDeep(textOutputMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as TextOutputData
  
  currentNode.value = node
  await nextTick() // 等待 DOM 渲染完毕
 
 
  if(inputRef.value && !node.data.saved) {
    const portId= nanoLowercaseAlphanumericId(10)
    currentNode.value.data!.inputVariable.id=portId
    addInputPort(props.id!, portId, 'aquamarine', inputRef.value.offsetTop)
  }

 
  if (footer.value && !node.data.saved) {
    const portId = nanoLowercaseAlphanumericId(10)
    currentNode.value.data!.outputVariable.id=portId
    addOutputPort(props.id!, portId, 'pink',footer.value.offsetTop + footer.value.clientHeight / 2)
  }

})

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})
const footer = ref<HTMLElement | null>(null)

// const editMode = ref(false)
 
watch(edges, () => {
  
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.inputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.inputVariable.id)
  
}, { deep: true, immediate: true })

</script>

<template>

  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]">
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
     

    <CardContent class="text-white space-y-8 -mt-8 flex-1 ">
      <Separator class="my-5" />
      <div>
        <div  ref="inputRef" class="flex flex-row items-center space-x-2">
          <p>Message<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />

        </div>
     
      </div>

    </CardContent>

    <div ref="footer" class="bg-[#27272A]  rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.outputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = true" />


        <div class="">Data</div>
      </div>

    </div>
  </Card>


</template>
