<script lang="ts" setup>
import type { FilterData } from '@/types/node-data/filter-data'

// import { Position, Handle } from '@vue-flow/core'
import { filterDataMeta } from '@/types/node-data/filter-data'

const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: FilterData } | null>(null)


// onMounted(() => {
//   if (currentNode.value && !currentNode.value.data.inputInputVariable.id) {
//     currentNode.value.data.inputInputVariable.id = nanoLowercaseAlphanumericId(10)
//   }
// })
</script>



<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="filterDataMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">
        <div class="relative">
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.inputInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full mt-5">
            <EditTextDialog v-model:input-variable="currentNode.data.inputInputVariable" />

          </div>
          <!-- <Handle type="target" :id="currentNode.data.inputInputVariable.id" :connectable-start="false" :position="Position.Left" :style="{ top: '12px', left: '-25px' }" /> -->

        </div>

        <div ref="filterKeyRef">
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.filterKeyInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full mt-5">
            <EditTextDialog v-model:input-variable="currentNode.data.filterKeyInputVariable" />

          </div>
        </div>

      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

      </template>
    </WorkflowBaseNode>

  </div>
</template>
