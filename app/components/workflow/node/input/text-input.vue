<script lang="ts" setup>
import type { TextInputData } from '~~/types/node-data/text-input'

import { textInputMeta } from '~~/types/node-data/text-input'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: TextInputData } | null>(null)



</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="textInputMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputInputVariable" />

      </template>

      <template #footer v-if="currentNode && currentNode.data">



        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
