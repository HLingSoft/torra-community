<script lang="ts" setup>
import type { FilterArray } from '~~/types/node-data/filter-array'

// import { Position, Handle } from '@vue-flow/core'
import { filterArrayMeta } from '~~/types/node-data/filter-array'

const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: FilterArray } | null>(null)


// onMounted(() => {
//   if (currentNode.value && !currentNode.value.data.inputInputVariable.id) {
//     currentNode.value.data.inputInputVariable.id = nanoLowercaseAlphanumericId(10)
//   }
// })
</script>



<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="filterArrayMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputInputVariable" />


                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.filterKeyInputVariable" />


            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
