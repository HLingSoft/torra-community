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

                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.baseURLInputVariable" />

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.imageDataInputVariable" :show-input="false" :handleBg="`oklch(82.7% 0.119 306.383)`" :description="`*支持图片链接或 Base64 格式，均可为数组`" />



                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.instructionInputVariable" />


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
