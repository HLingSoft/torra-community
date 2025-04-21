<script lang="ts" setup>
import  { chatOutputMeta } from '@/types/node-data/chat-output'
import type { ChatOutputData} from '@/types/node-data/chat-output'
import { createPortManager } from '~/components/workflow/useNodePorts'

import { useVueFlow } from '@vue-flow/core'

const { nodeExecutionTimes } = useNodeExecutionStats()

// 引入公共样式
const props = defineProps({
  id: String

})
const currentNode = ref<{ id: string, data?: ChatOutputData }>()
const { addInputPort, addOutputPort } = createPortManager()
const { nodes,edges} = storeToRefs(useWorkflowStore())
const inputRef = ref<HTMLElement | null>(null)
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ...chatOutputMeta,
    ...node.data, // ✅ 已有字段优先级更高，会覆盖默认值
  } as ChatOutputData
  
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

const editMode = ref(false)
 
watch(edges, () => {
  
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.inputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.inputVariable.id)
  
}, { deep: true, immediate: true })

</script>

<template>

  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]">
    <CardHeader>
      <CardTitle class="text-white flex flex-row  items-center justify-between">
        <div class="flex flex-row space-x-2 items-center">
          <div class="bg-[#27272A] rounded-lg p-1  ">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="">

            <Input v-if="editMode" class="w-60 nodrag nopan" type="text" v-model=" currentNode.data. title" />
            <div v-else>{{ currentNode.data. title }}</div>
          </div>
        </div>
        <div :class="[
          'bg-[#27272A] cursor-pointer transition-all duration-200 rounded-lg p-1',
          editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]">
          <NuxtIcon @click.stop="editMode = !editMode" name="iconamoon:edit-light" size="20" class="text-white" />
        </div>
      </CardTitle>

      <CardDescription class=" mt-3  p-2 rounded-lg">
        <Input v-if="editMode" class="w-full nodrag nopan text-white" type="text" placeholder="" v-model=" currentNode.data. description" />
        <div v-else class="text-[#D1D5DB]">{{  currentNode.data. description }}</div>

        <div class="h-5 flex items-center">
          <div v-if="props.id && nodeExecutionTimes[props.id]" class="  text-green-300 font-mono">
            ⏱️ 耗时：{{ nodeExecutionTimes[props.id] }}
          </div>
        </div>
      </CardDescription>
    </CardHeader>

    <CardContent class="text-white space-y-8 -mt-8 flex-1 ">
      <Separator class="my-5" />
      <div>
        <div  ref="inputRef" class="flex flex-row items-center space-x-2">
          <p>Text<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />

        </div>
        <!-- <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="请输入文本" />  
             <NuxtIcon name="solar:full-screen-broken" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>

        </div> -->
      </div>

    </CardContent>

    <div ref="footer" class="bg-[#27272A]  rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.show = true" />


        <div class="">Message</div>
      </div>

    </div>
  </Card>


</template>
