<script lang="ts" setup>
import type { SpeechGenerateEleventlabsData, VoiceItem } from '~~/types/node-data/speech-generate-elevenlabs'

import { speechGenerateEleventlabsMeta } from '~~/types/node-data/speech-generate-elevenlabs'

import { cn } from '@/lib/utils'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: SpeechGenerateEleventlabsData } | null>(null)

const speedArray = computed<number[]>({
    get: () => [currentNode.value?.data?.speed ?? 1],
    set: (val) => {
        if (currentNode.value?.data) {
            currentNode.value.data.speed = val[0] as number
        }
    },
})


const isFetchingVoices = ref(false)
const allVoices = ref<VoiceItem[]>([])
//监听currentNode.data.apiKeyInputVariable

const fetchVoice = async () => {
    if (!currentNode.value?.data.apiKeyInputVariable.value) {
        useToast('Please set the API key first');
        return;
    }
    isFetchingVoices.value = true;

    try {
        isFetchingVoices.value = true;
        const response = await $fetch<VoiceItem[]>('/api/local/fetchEleventlabs', {
            method: 'POST',
            body: {
                apiKey: currentNode.value.data.apiKeyInputVariable.value,
            },
        });
        allVoices.value = response;


    } catch (error) {
        console.error('Error fetching voices:', error);
        allVoices.value = [];
    } finally {
        isFetchingVoices.value = false;
    }

}
const { mini } = useMiniNode()
</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="speechGenerateEleventlabsMeta" @not-found="() => { }">
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


                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center justify-between">
                        <div class="flex flex-row items-center space-x-2">
                            <p>Voice</p>
                            <NuxtIcon name="clarity:info-line" size="20" />
                        </div>
                        <div>
                            <Button variant="outline" size="sm" :disabled="isFetchingVoices" @click="fetchVoice">Fetch</Button>
                        </div>
                    </div>

                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.voice">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Voice" />
                            </SelectTrigger>
                            <SelectContent>

                                <SelectGroup>
                                    <SelectItem v-for="(voice, key) in allVoices" :key="key" :value="voice.id">{{ voice.name }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div v-show="!mini">
                    <div class="flex flex-row items-center justify-between space-x-2">
                        <div class="flex flex-row items-center space-x-2">
                            <p>Speed</p>
                            <NuxtIcon name="clarity:info-line" size="20" />
                        </div>
                        <div class="font-mono ">
                            {{ currentNode.data.speed }}
                        </div>
                    </div>
                    <div class="w-full  mt-5">
                        <Slider v-model="speedArray" :max="1.25" :min="0.75" :step="0.1" :class="cn('w-full cursor-pointer', $attrs.class ?? '')" />
                        <div class="flex text-muted-foreground text-sm mt-3 justify-between">
                            <span>Slower</span>
                            <span>Faster</span>
                        </div>
                    </div>
                </div>
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.userInputInputVariable" />
                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.userInputInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.userInputInputVariable" />
                    </div>

                </div> -->

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.base64VoiceOutputVariable" />

                </div>
            </template>
        </WorkflowBaseNode>
    </div>
</template>
