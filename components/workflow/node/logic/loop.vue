<script lang="ts" setup>
import type { LoopData } from '@/types/node-data/loop'

import { loopMeta } from '@/types/node-data/loop'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: LoopData } | null>(null)



</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="loopMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <div class="relative">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.listDataInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog v-model:input-variable="currentNode.data.listDataInputVariable" :show-input="false" :handleBg="`oklch(82.3% 0.12 346.018)`" />
                    </div>
                    <!-- <Handle type="target" :id="currentNode.data.listDataInputVariable.id" :connectable-start="false" :position="Position.Left" :style="{ top: '12px', left: '-25px', '--handle-bg': 'oklch(82.3% 0.12 346.018)' }" /> -->
                </div>

                <div class="relative mt-5">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.loopItemResultInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog v-model:input-variable="currentNode.data.loopItemResultInputVariable" :show-input="false" />
                    </div>
                    <!-- <Handle type="target" :id="currentNode.data.loopItemResultInputVariable.id" :connectable-start="false" :position="Position.Left" :style="{ top: '12px', left: '-25px' }" /> -->

                </div>

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
