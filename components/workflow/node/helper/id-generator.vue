<script lang="ts" setup>
import type { IDGeneratorData } from '@/types/node-data/id-generator'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { iDGeneratorMeta } from '@/types/node-data/id-generator'
import { useVueFlow } from '@vue-flow/core'
import { nanoid } from 'nanoid'
const props = defineProps<{
  id: string
}>()
// const { nodeExecutionTimes } = useNodeExecutionStats()
// const editMode = ref(false)

const footer = ref<HTMLElement | null>(null)
const currentNode = ref<{ id: string, data?: IDGeneratorData }>()

const { addOutputPort } = createPortManager()
const { nodes } = storeToRefs(useWorkflowStore())
const { onNodeClick } = useVueFlow()

onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ..._.cloneDeep(iDGeneratorMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as IDGeneratorData

  currentNode.value = node

  if (!currentNode.value.data?.inputValue) {
    currentNode.value.data!.inputValue = `${nanoid(6)}-${nanoid(6)}-${nanoid(6)}-${nanoid(6)}`
  }

  await nextTick()
  if (footer.value && !node.data.saved) {
    const outputPortId = nanoLowercaseAlphanumericId(10)
    node.data.outputVariable.id = outputPortId
    const offset = footer.value.offsetTop + footer.value.clientHeight / 2
    addOutputPort(props.id, outputPortId, 'pink', offset)
  }
})

const refreshID = async () => {
  const confirmed = await useConfirm({
    title: '提示',
    description: '刷新 ID 会导致当前 ID 失效，是否继续？',
    confirmText: '刷新',
    cancelText: '取消',
  })

  if (confirmed) {
    currentNode.value!.data!.inputValue = `${nanoid(6)}-${nanoid(6)}-${nanoid(6)}-${nanoid(6)}`
  }
}

onNodeClick((event) => {


})
</script>

<template>
  <!-- flex flex-col gap-6  border  pt-6 shadow-sm rounded-xl   text-card-foreground hover:shadow-lg transition-shadow duration-300 hover:shadow-[rgba(219,219,219,0.66)] -->
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-background rounded-lg group flex flex-col focus:outline-none focus:shadow-lg focus:shadow-card  focus:border focus: border-card">
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id" />

    <CardContent class="text-white flex flex-col space-y-8 -mt-8 flex-1">
      <Separator class="my-5" />
      <div>
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-row items-center space-x-2">
            <p>Value</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <Button variant="outline" size="sm" class="text-sm" @click="refreshID">
            <NuxtIcon name="solar:refresh-line-duotone" size="18" />
          </Button>
        </div>
        <div class="w-full mt-5">


          <GlobalVariablePopover class="w-full" :model-value="currentNode.data.inputValue || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.inputValue = val">
          </GlobalVariablePopover>

        </div>
      </div>
    </CardContent>

    <div ref="footer" class="bg-card rounded-b-lg py-2 pl-5 pr-10 flex items-center justify-center w-full">
      <div class="w-full h-full flex items-center justify-between">
        <NuxtIcon v-if="currentNode.data.outputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = false" />
        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.outputVariable.show = true" />
        <div class="">
          Message
        </div>
      </div>
    </div>



  </Card>
</template>
