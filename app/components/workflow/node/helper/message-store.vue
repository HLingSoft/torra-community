<script lang="ts" setup>
import type { MessageStoreData } from '~~/types/node-data/message-store'
import { messageStoreMeta } from '~~/types/node-data/message-store'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: MessageStoreData } | null>(null)


</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="messageStoreMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">
        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.messageInputVariable" />

        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.memoryInputVariable" :show-input="false" :handleBg="`oklch(66.6% 0.179 58.318)`" />



      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <div class="flex flex-col space-y-2">
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.dataOutputVariable" class="!rounded-b-none" />
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.storedMessagesOutputVariable" />
        </div>

      </template>
    </WorkflowBaseNode>
  </div>
</template>
