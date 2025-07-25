<script lang="ts" setup>
import type { ImageRecognitionOpenAIData } from '~~/types/node-data/image-recognition-openai'

import { imageRecognitionOpenAIMeta } from '~~/types/node-data/image-recognition-openai'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ImageRecognitionOpenAIData } | null>(null)






</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="imageRecognitionOpenAIMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.apiKeyInputVariable" />
                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.apiKeyInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.apiKeyInputVariable" />
                    </div>
                </div> -->
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.baseURLInputVariable" />
                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.baseURLInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.baseURLInputVariable" />
                    </div>
                </div> -->
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.imageDataInputVariable" :show-input="false" :handleBg="`oklch(82.7% 0.119 306.383)`" :description="`*支持图片链接或 Base64 格式，均可为数组`" />



                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.imageDataInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <div class="mt-5 w-full">
                        <EditTextDialog v-model:input-variable="currentNode.data.imageDataInputVariable" :show-input="false" :handleBg="`oklch(82.7% 0.119 306.383)`" />
                    </div>
                    <p class="text-muted-foreground text-sm ">*支持图片链接或 Base64 格式，均可为数组</p>

                </div> -->
                <!-- <Separator class="my-2" />
                <p class="text-muted-foreground text-sm   text-left">*作为工具输出时，以下字段由 Agent 自动提供，无需手动填写.</p> -->

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.instructionInputVariable" />



                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.instructionInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.instructionInputVariable" />
                    </div>


                </div> -->

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.toolOutputVariable" />

                </div>
            </template>
        </WorkflowBaseNode>
    </div>
</template>
