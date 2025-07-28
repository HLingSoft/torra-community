<script lang="ts" setup>
import type { ReplicateKlingVideoData } from '~~/types/node-data/video-replicate-kling'

import { replicateKlingVideoMeta, allMode } from '~~/types/node-data/video-replicate-kling'


const allAspectRatio = [
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' },

]

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ReplicateKlingVideoData } | null>(null)

const { mini } = useMiniNode()


</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="replicateKlingVideoMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.authInputVariable" />

                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Mode</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.mode">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Voice" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>

                                    <SelectItem v-for="(value, index) in allMode" :key="index" :value="value">{{ value }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Duration</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <NumberField :default-value="5" v-model.number="currentNode.data.duration" :min="2" :max="10">
                            <NumberFieldContent>
                                <NumberFieldDecrement />
                                <NumberFieldInput />
                                <NumberFieldIncrement />
                            </NumberFieldContent>
                        </NumberField>
                    </div>
                </div>

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

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.promptInputport" />

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.startImageInputport" />


                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.negativePromptInputport" />

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.base64VideoOutputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.toolOutputVariable" />

                </div>
            </template>
        </WorkflowBaseNode>
    </div>
</template>
