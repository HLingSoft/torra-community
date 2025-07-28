<script lang="ts" setup>
import { chatOutputMeta } from '~~/types/node-data/chat-output'
import type { ChatOutputData } from '~~/types/node-data/chat-output'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ChatOutputData } | null>(null)

</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="chatOutputMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">
        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputInputVariable" :show-input="false" />

      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
