<script lang="ts" setup>
import type { ListenData } from '~~/types/node-data/listen'

import { listenMeta } from '~~/types/node-data/listen'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ListenData } | null>(null)



</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="listenMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.nameInputVariable" />
                <!-- <div>
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.nameInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.nameInputVariable" />
                    </div>
                </div> -->
            </template>

            <template #footer v-if="currentNode && currentNode.data">



                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
