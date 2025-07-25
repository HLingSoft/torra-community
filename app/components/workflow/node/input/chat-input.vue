<script lang="ts" setup>
import type { ChatInputData } from '~~/types/node-data/chat-input'

import { chatInputMeta } from '~~/types/node-data/chat-input'


const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ChatInputData } | null>(null)

const { mini } = useMiniNode()
</script>



<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="chatInputMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div v-show="!mini" class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full ">
          <div class="flex flex-row items-center space-x-2">
            <p>Dynamic Text</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <Switch v-model="currentNode.data.dynamicValue" />


        </div>
        <div v-show="!mini">
          <div class="flex flex-row items-center space-x-2">
            <p>Text</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full mt-5">
            <Input v-model="currentNode.data.inputValue" class="w-full" :disabled="currentNode.data.dynamicValue" placeholder="请输入文本" />

          </div>
        </div>

      </template>

      <template #footer v-if="currentNode && currentNode.data">



        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
