<script lang="ts" setup>
import type { DataToMessageData } from '~~/types/node-data/data-to-message'

import { dataToMessageMeta } from '~~/types/node-data/data-to-message'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: DataToMessageData } | null>(null)
const roles = [
    {
        id: 'AI',
        name: 'AI',
    },
    {
        id: 'Human',
        name: 'Human',
    },
    {
        id: 'System',
        name: 'System',
    },
]

const { mini } = useMiniNode()
</script>




<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="dataToMessageMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputInputVariable" />

                <div v-show="!mini" class="w-full">
                    <div class="flex flex-row items-center space-x-2 w-full">
                        <p>Role</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full flex items-center justify-between  mt-4">
                        <Select v-model="currentNode.data.role" class="w-full">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select message role" />
                            </SelectTrigger>
                            <SelectContent teleport="body">
                                <SelectGroup>
                                    <SelectItem v-for="role in roles" :key="role.id" :value="role.id" class="text-sm">
                                        {{ role.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />

            </template>
        </WorkflowBaseNode>


    </div>
</template>
