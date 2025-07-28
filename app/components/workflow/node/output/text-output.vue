<script lang="ts" setup>
import { textOutputMeta } from '~~/types/node-data/text-output'
import type { TextOutputData } from '~~/types/node-data/text-output'
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
        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.messageInputVariable" :show-input="false" />

      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
