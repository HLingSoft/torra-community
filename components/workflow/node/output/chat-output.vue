<script lang="ts" setup>
import { chatOutputMeta } from '@/types/node-data/chat-output'
import type { ChatOutputData } from '@/types/node-data/chat-output'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ChatOutputData } | null>(null)

</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="chatOutputMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div class="relative">
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.inputInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />

          </div>
          <div class="mt-5 w-full">
            <EditTextDialog v-model:input-variable="currentNode.data.inputInputVariable" :show-input="false" />
          </div>


        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
