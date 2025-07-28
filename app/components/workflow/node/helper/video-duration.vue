<script lang="ts" setup>

import type { VideoDurationData } from '~~/types/node-data/video-duration'
import { videoDurationMeta } from '~~/types/node-data/video-duration'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string; data: VideoDurationData } | null>(null)

</script>


<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="videoDurationMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.urlInputportVariable" />

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />
            </template>
        </WorkflowBaseNode>
    </div>
</template>
