<script lang="ts" setup>
import type { MessageToDataData } from '~~/types/node-data/message-to-data'

import { messageToDataMeta } from '~~/types/node-data/message-to-data'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: MessageToDataData } | null>(null)

</script>




<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="messageToDataMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">


        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputInputVariable" />


      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>


  </div>
</template>
