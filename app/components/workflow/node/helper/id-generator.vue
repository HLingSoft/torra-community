<script lang="ts" setup>
import type { IDGeneratorData } from '~~/types/node-data/id-generator'

import { iDGeneratorMeta } from '~~/types/node-data/id-generator'

import { nanoid } from 'nanoid'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: IDGeneratorData } | null>(null)


onMounted(() => {
  if (currentNode.value && !currentNode.value.data.inputValue) {
    currentNode.value.data.inputValue = `${nanoid(6)}-${nanoid(6)}-${nanoid(6)}-${nanoid(6)}`
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

</script>

<template>


  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="iDGeneratorMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

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

          <Input v-model="currentNode.data.inputValue" type="text" class="w-full pr-10 " placeholder="Typing something" />


        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />
      </template>
    </WorkflowBaseNode>
  </div>
</template>
