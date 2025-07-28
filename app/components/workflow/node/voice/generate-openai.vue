<script lang="ts" setup>
import type { SpeechGenerateOpenAIData } from '~~/types/node-data/speech-generate-openai'

import { speechGenerateOpenAIMeta, allVoices } from '~~/types/node-data/speech-generate-openai'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: SpeechGenerateOpenAIData } | null>(null)


const { mini } = useMiniNode()

</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="speechGenerateOpenAIMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.apiKeyInputVariable" />

                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.baseURLInputVariable" />


                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Voice</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.voice">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Voice" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allVoices" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>



                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.userInputInputVariable" />

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.instructionInputVariable" />


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
