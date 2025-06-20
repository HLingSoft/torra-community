<script lang="ts" setup>
import { textOutputMeta } from '@/types/node-data/text-output'
import type { TextOutputData } from '@/types/node-data/text-output'
// import { Position, Handle } from '@vue-flow/core'
const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: TextOutputData } | null>(null)

// onMounted(() => {
//   if (currentNode.value && !currentNode.value.data.messageInputVariable.id) {
//     currentNode.value.data.messageInputVariable.id = nanoLowercaseAlphanumericId(10)
//   }
// })
</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="textOutputMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div class="relative">
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.messageInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <EditTextDialog v-model:input-variable="currentNode.data.messageInputVariable" :show-input="false" />
          </div>
          <!-- <Handle type="target" :id="currentNode.data.messageInputVariable.id" :connectable-start="false" :position="Position.Left" :style="{ top: '12px', left: '-25px' }" /> -->

        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
