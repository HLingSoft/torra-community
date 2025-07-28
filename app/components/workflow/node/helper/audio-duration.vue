<script lang="ts" setup>

import type { AudioDurationData } from '~~/types/node-data/audio-duration'
import { audioDurationMeta } from '~~/types/node-data/audio-duration'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string; data: AudioDurationData } | null>(null)

</script>


<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="audioDurationMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.urlInputportVariable" />

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />
            </template>
        </WorkflowBaseNode>
    </div>
</template>
