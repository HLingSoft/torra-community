<script lang="ts" setup>
import type { ReplicateFluxData } from '~~/types/node-data/image-generate-replicate-flux'

import { replicateFluxMeta } from '~~/types/node-data/image-generate-replicate-flux'

const allAspectRatio = [
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' },
    { label: '3:4', value: '3:4' },
    { label: '2:3', value: '2:3' },
    { label: '3:2', value: '3:2' },
]

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ReplicateFluxData } | null>(null)

const { mini } = useMiniNode()
</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="replicateFluxMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.authInputVariable" />
                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.authInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.authInputVariable" />
                    </div>
                </div> -->


                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.promptInputport" />
                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.promptInputport.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.promptInputport" />
                    </div>
                </div> -->


                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.imagePromptInputPortVariable" />


                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.imagePromptInputPortVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.imagePromptInputPortVariable" />
                    </div>
                </div> -->


                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Aspect Ratio</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.aspectRatio">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Aspect Ratio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem :value="aspectRatio.value" v-for="aspectRatio in allAspectRatio">{{ aspectRatio.label }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>




            </template>

            <template #footer v-if="currentNode && currentNode.data">

                <NodeCardOutputFooter v-model:output-variable="currentNode.data.base64ImageOutputVariable" />



            </template>
        </WorkflowBaseNode>
    </div>
</template>
