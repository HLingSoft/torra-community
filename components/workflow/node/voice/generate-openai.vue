<script lang="ts" setup>
import type { SpeechGenerateOpenAIData } from '~/types/node-data/speech-generate-openai'

import { speechGenerateOpenAIMeta, allVoices } from '~/types/node-data/speech-generate-openai'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: SpeechGenerateOpenAIData } | null>(null)




</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="speechGenerateOpenAIMeta" @not-found="() => { }">
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

                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Voice</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.voice">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Voice" />
                            </SelectTrigger>
                            <SelectContent class="dark">
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allVoices" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                <Separator class="my-2" />
                <p class="text-muted-foreground text-sm   text-left">*作为工具输出时，以下字段由 Agent 自动提供，无需手动填写.</p>

                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.userInputInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.userInputInputVariable" />
                    </div>

                </div>
                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.instructionInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.instructionInputVariable" />
                    </div>

                </div>

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.base64VoiceOutputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.toolOutputVariable" />

                </div>
            </template>
        </WorkflowBaseNode>
    </div>
</template>
