<script lang="ts" setup>
import type { PassData } from '~~/types/node-data/pass'

import { passMeta } from '~~/types/node-data/pass'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: PassData } | null>(null)



</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="passMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputInputVariable" :show-input="false" :handle-bg="`var(--clr-any)`" />

            </template>

            <template #footer v-if="currentNode && currentNode.data">



                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
