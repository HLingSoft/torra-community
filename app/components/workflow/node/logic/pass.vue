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
                <!-- <div>
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.inputInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.inputInputVariable" :show-input="false" :handle-bg="`var(--clr-any)`" />
                    </div>
                </div> -->
            </template>

            <template #footer v-if="currentNode && currentNode.data">



                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
