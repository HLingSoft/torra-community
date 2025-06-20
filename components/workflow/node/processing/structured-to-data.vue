<script lang="ts" setup>
import type { StructuredToDataData } from '@/types/node-data/structured-to-data'

import { structuredToDataMeta } from '@/types/node-data/structured-to-data'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: StructuredToDataData } | null>(null)



</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="structuredToDataMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.structuredDataInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full mt-5">
            <EditTextDialog v-model:input-variable="currentNode.data.structuredDataInputVariable" :show-input="false"/>

          </div>
        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">



        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
