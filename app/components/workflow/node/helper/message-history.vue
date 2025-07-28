<script lang="ts" setup>
import type { MessageHistoryData } from '~~/types/node-data/message-history'
import { messageHistoryMeta } from '~~/types/node-data/message-history'


const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: MessageHistoryData } | null>(null)

const { mini } = useMiniNode()

</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="messageHistoryMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">


        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.memoryInputVariable" :show-input="false" :handleBg="`oklch(66.6% 0.179 58.318)`" :description="`Connect an upstream memory module (e.g., Redis Chat Memory) to retrieve conversation history.`" />



        <div v-show="!mini">
          <div id="maxMessages" class="  flex w-full flex-row items-center space-x-2">
            <p>Max Messages</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="mt-5">
            <NumberField id="maxMessages" v-model="currentNode.data.maxMessages" :max="100" :min="0">

              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>


        </div>


      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <div class="flex flex-col space-y-2">
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.dataOutputVariable" class="!rounded-b-none" />
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.messageOutputVariable" />
        </div>
      </template>
    </WorkflowBaseNode>
  </div>
</template>
