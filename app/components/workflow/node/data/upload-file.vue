<script lang="ts" setup>
import type { UploadFileData } from '~~/types/node-data/upload-file'


import { uploadFileMeta } from '~~/types/node-data/upload-file'


const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: UploadFileData } | null>(null)



</script>

<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="uploadFileMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">



            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputPortVariable" />
            </template>
        </WorkflowBaseNode>

    </div>


</template>
