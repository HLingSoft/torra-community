<script lang="ts" setup>
import type { CombineDataData } from '@/types/node-data/combine-data'


import { combineDataMeta } from '@/types/node-data/combine-data'


const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: CombineDataData } | null>(null)




//append/merge/concatenate/join
const allOperationType = [
    { value: 'append', name: 'Append' },
    { value: 'merge', name: 'Merge' },
    { value: 'concatenate', name: 'Concatenate' },
    { value: 'join', name: 'Join' }

]


</script>

<template>
    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="combineDataMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">

                <div ref="urlInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.dataInputsInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">

                        <EditTextDialog v-model:input-variable="currentNode.data.dataInputsInputVariable" :show-input="false" />
                    </div>
                    <div class="mt-3 text-xs text-muted-foreground">*支持多个连线接入或者数组数据</div>
                </div>


                <div class="w-full">
                    <div class="flex flex-row items-center space-x-2 w-full">
                        <p>Operation Type</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full flex items-center justify-between  mt-4">
                        <Select v-model="currentNode.data.operationType" class="w-full">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a operation type" />
                            </SelectTrigger>
                            <SelectContent class="w-full dark " teleport="body">
                                <SelectGroup>
                                    <SelectItem v-for="operationType in allOperationType" :key="operationType.name" :value="operationType.value">
                                        {{ operationType.name }}
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
