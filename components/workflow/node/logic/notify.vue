<script lang="ts" setup>
import type { NotifyData } from '@/types/node-data/notify'

import { notifyMeta } from '@/types/node-data/notify'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: NotifyData } | null>(null)



</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="notifyMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <div class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Append</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <Switch v-model="currentNode.data.isAppend" />
                </div>
                <div>
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.dataInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.dataInputVariable" :show-input="false" />
                    </div>
                </div>


                <div>
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.notifyNameInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.notifyNameInputVariable" />
                    </div>
                </div>
            </template>

            <template #footer v-if="currentNode && currentNode.data">



                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
