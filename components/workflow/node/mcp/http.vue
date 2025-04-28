<script lang="ts" setup>
import type { MCPHttpData } from '@/types/node-data/mcp-http'


import { mcpHttpMeta } from '@/types/node-data/mcp-http'

import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
// 引入公共样式
const props = defineProps({
  id: String,

})

const currentNode = ref<{ id: string, data?: MCPHttpData }>()


const tokenVariableRef = ref<HTMLElement | null>(null)
const urlVariableRef = ref<HTMLElement | null>(null)
const outputVariableRef = ref<HTMLElement | null>(null)


const { addInputPort, addOutputPort } = createPortManager()
const { nodes, edges, currentWorkflow } = storeToRefs(useWorkflowStore())
onMounted(async () => {
  await until(currentWorkflow).toBeTruthy()
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  // 初始化 data
  node.data = {
    ..._.cloneDeep(mcpHttpMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as MCPHttpData

  currentNode.value = node

  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port



  if (tokenVariableRef.value && !node.data.saved) {
    currentNode.value.data!.tokenVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.tokenVariable.id, 'aquamarine', tokenVariableRef.value.offsetTop + tokenVariableRef.value.clientHeight / 2 - 10)
  }


  if (urlVariableRef.value && !node.data.saved) {
    currentNode.value.data!.urlVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.urlVariable.id, 'aquamarine', urlVariableRef.value.offsetTop + urlVariableRef.value.clientHeight / 2 - 10)
  }


  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (outputVariableRef.value && !node.data.saved) {
    currentNode.value.data!.outputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.outputVariable.id, 'orange', outputVariableRef.value.offsetTop + outputVariableRef.value.clientHeight / 2)
  }


})

watch(edges, () => {

  if (!currentNode.value?.data) {
    return
  }


  currentNode.value.data.tokenVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.tokenVariable.id)
  currentNode.value.data.urlVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.urlVariable.id)
}, { deep: true, immediate: true })

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {


})



</script>

<template>
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-background  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-card   focus:border focus: border-card">

    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />
    <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />






      <div ref="urlVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>MCP URL<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <GlobalVariablePopover class="w-full" :disabled="currentNode.data.urlVariable.connected" :model-value="currentNode.data.urlVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.urlVariable.value = val">
          </GlobalVariablePopover>
        </div>
      </div>

      <div ref="tokenVariableRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Authorization Token</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <GlobalVariablePopover class="w-full" :disabled="currentNode.data.tokenVariable.connected" :model-value="currentNode.data.tokenVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.tokenVariable.value = val">
          </GlobalVariablePopover>
        </div>
      </div>


    </CardContent>

    <div ref="outputVariableRef" class="bg-card   py-2 pl-5 pr-10 rounded-b-lg  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.outputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = true" />

        <div class="  ">
          Tools
        </div>
      </div>
    </div>

  </Card>
</template>
