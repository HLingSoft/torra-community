<script lang="ts" setup>
import type { DataToStructuredData } from '~~/types/node-data/data-to-structured'

import { dataToStructuredMeta } from '~~/types/node-data/data-to-structured'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: DataToStructuredData } | null>(null)



</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="dataToStructuredMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.dataInputVariable" :show-input="false" />

            </template>

            <template #footer v-if="currentNode && currentNode.data">



                <NodeCardOutputFooter v-model:output-variable="currentNode.data.structuredDataOutputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
