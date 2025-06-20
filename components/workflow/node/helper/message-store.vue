<script lang="ts" setup>
import type { MessageStoreData } from '@/types/node-data/message-store'
import { messageStoreMeta } from '@/types/node-data/message-store'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: MessageStoreData } | null>(null)


</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="messageStoreMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">
        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.messageInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <EditTextDialog v-model:input-variable="currentNode.data.messageInputVariable" />
          </div>
        </div>



        <div class="relative">
          <div class="  flex w-full flex-row items-center space-x-2">
            <p>{{ currentNode.data.memoryInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <p class="text-[#D1D5DB] text-sm">Connect an upstream memory module (e.g., Redis Chat Memory) to retrieve conversation history.</p>
          <div class="mt-5 w-full">
            <EditTextDialog v-model:input-variable="currentNode.data.memoryInputVariable" :show-input="false" :handleBg="`oklch(66.6% 0.179 58.318)`" />
          </div>
          <!-- <Handle type="target" :id="currentNode.data.memoryInputVariable.id" :connectable-start="false" :position="Position.Left" :style="{ top: '12px', left: '-25px', '--handle-bg': 'oklch(66.6% 0.179 58.318)' }" /> -->
        </div>


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
