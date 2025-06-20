<script lang="ts" setup>
import type { TextInputData } from '@/types/node-data/text-input'

import { textInputMeta } from '@/types/node-data/text-input'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: TextInputData } | null>(null)



</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="textInputMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.inputInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full mt-5">
            <EditTextDialog v-model:input-variable="currentNode.data.inputInputVariable" />

          </div>
        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">



        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
