<script lang="ts" setup>
import type { LoopData } from '~~/types/node-data/loop'

import { loopMeta } from '~~/types/node-data/loop'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: LoopData } | null>(null)



</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="loopMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.listDataInputVariable" :show-input="false" :handleBg="`var(--clr-messages)`" />


                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.loopItemResultInputVariable" :show-input="false" />



            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.itemOutputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.doneOutputVariable" />
                </div>

            </template>
        </WorkflowBaseNode>

    </div>
</template>
