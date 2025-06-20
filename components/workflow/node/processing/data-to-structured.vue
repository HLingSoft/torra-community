<script lang="ts" setup>
import type { DataToStructuredData } from '@/types/node-data/data-to-structured'

import { dataToStructuredMeta } from '@/types/node-data/data-to-structured'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: DataToStructuredData } | null>(null)



</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="dataToStructuredMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">

                <div>
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.dataInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.dataInputVariable" :show-input="false" />

                    </div>
                </div>
            </template>

            <template #footer v-if="currentNode && currentNode.data">



                <NodeCardOutputFooter v-model:output-variable="currentNode.data.structuredDataOutputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
