<script lang="ts" setup>
import type { NotifyData } from '~~/types/node-data/notify'

import { notifyMeta } from '~~/types/node-data/notify'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: NotifyData } | null>(null)

const { mini } = useMiniNode()

</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="notifyMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <div v-show="!mini" class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Append</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <Switch v-model="currentNode.data.isAppend" />
                </div>
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.dataInputVariable" :show-input="false" />

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.notifyNameInputVariable" :show-input="false" />

            </template>

            <template #footer v-if="currentNode && currentNode.data">



                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

            </template>
        </WorkflowBaseNode>

    </div>
</template>
