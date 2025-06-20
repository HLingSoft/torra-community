<script lang="ts" setup>
import type { SpeechRecognitionOpenAIData } from '@/types/node-data/speech-recognition-openai'

import { speechRecognitionOpenAIMeta, languages } from '@/types/node-data/speech-recognition-openai'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: SpeechRecognitionOpenAIData } | null>(null)



</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="speechRecognitionOpenAIMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">

                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.apiKeyInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.apiKeyInputVariable" />
                    </div>
                </div>
                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.baseURLInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.baseURLInputVariable" />
                    </div>
                </div>
                <!-- <div class="">
                  
                </div> -->

                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.voiceDataInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <div class="mt-5 w-full">
                        <EditTextDialog v-model:input-variable="currentNode.data.voiceDataInputVariable" :show-input="false" :handleBg="`oklch(82.7% 0.119 306.383)`" />
                    </div>
                    <p class="text-muted-foreground text-sm ">*支持URL链接或 Base64 格式。不支持数组。</p>

                </div>
                <Separator class="my-2" />
                <p class="text-muted-foreground text-sm   text-left">*作为工具输出时，以下字段由 Agent 自动提供，无需手动填写.</p>

                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.instructionInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.instructionInputVariable" />
                    </div>


                </div>
                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Language </p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select class="w-full" v-model="currentNode.data.languageModelName">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a operator" />
                            </SelectTrigger>
                            <SelectContent class="dark max-h-72 overflow-y-auto" teleport="body">
                                <SelectGroup>
                                    <SelectItem v-for="item in languages" :key="item.id" :value="item.id">
                                        {{ item.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>


                </div>

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
