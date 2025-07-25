<script lang="ts" setup>
import type { SpeechGenerateMinimaxData } from '~~/types/node-data/speech-generate-replicate-minimax'
import { speechGenerateMinimaxMeta } from '~~/types/node-data/speech-generate-replicate-minimax'

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const props = defineProps<{ id: string }>()

// WorkflowBaseNode 会通过 v-model:currentNode 双向绑定 node 数据
// currentNode.data 即为 SpeechGenerateMinimaxData
const currentNode = ref<{ id: string; data: SpeechGenerateMinimaxData } | null>(null)

// 固定可选项 – 可按需增删
const voiceOptions = [
    { label: 'Friendly_Person', value: 'Friendly_Person' },
    { label: 'Narrator_Male', value: 'Narrator_Male' },
    { label: 'Narrator_Female', value: 'Narrator_Female' },
]

const emotionOptions = [
    { label: 'Happy', value: 'happy' },
    { label: 'Neutral', value: 'neutral' },
    { label: 'Sad', value: 'sad' },
    { label: 'Angry', value: 'angry' },
]

const speedArray = computed<number[]>({
    get: () => [currentNode.value?.data?.speed ?? 1],
    set: (val) => {
        if (currentNode.value?.data) {
            currentNode.value.data.speed = val[0] as number
        }
    },
})
const volumeArray = computed<number[]>({
    get: () => [currentNode.value?.data?.volume ?? 1],
    set: (val) => {
        if (currentNode.value?.data) {
            currentNode.value.data.volume = val[0] as number
        }
    },
})
const { mini } = useMiniNode()
</script>

<template>
    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="speechGenerateMinimaxMeta" @not-found="() => { }">
            <!-- ================= CONTENT ================ -->
            <template #content v-if="currentNode && currentNode.data">
                <!-- Auth Token -->
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.authInputVariable" />
                <!-- <div class="flex flex-col mb-6">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.authInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.authInputVariable" />
                    </div>
                </div> -->

                <!-- User Text Input -->
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.userInputInputVariable" />
                <!-- <div class="flex flex-col mb-6">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.userInputInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.userInputInputVariable" />
                    </div>
                </div> -->

                <!-- Voice ID Select -->
                <div v-show="!mini" class="flex flex-col mb-6">
                    <div class="flex flex-row items-center space-x-2 mb-2">
                        <p>Voice ID</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <Select v-model="currentNode.data.voiceId" class="w-full">
                        <SelectTrigger class="w-full">
                            <SelectValue :placeholder="'Select Voice'" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="v in voiceOptions" :key="v.value" :value="v.value">
                                {{ v.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Emotion Select -->
                <div v-show="!mini" class="flex flex-col mb-6">
                    <div class="flex flex-row items-center space-x-2 mb-2">
                        <p>Emotion</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <Select v-model="currentNode.data.emotion" class="w-full">
                        <SelectTrigger class="w-full">
                            <SelectValue :placeholder="'Select Emotion'" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="e in emotionOptions" :key="e.value" :value="e.value">
                                {{ e.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Speed Slider -->
                <div v-show="!mini" class="flex flex-col mb-6">
                    <div class="flex flex-row items-center space-x-2 mb-2">
                        <p>Speed (0.5 – 2.0)</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full mt-2">
                        <Slider v-model="speedArray" :max="2" :min="0.5" :step="0.1" :class="cn('w-full cursor-pointer')" />
                        <div class="flex text-muted-foreground text-sm mt-3 justify-between">
                            <span>Slow</span>
                            <span>Fast</span>
                        </div>
                    </div>
                </div>

                <!-- Volume Slider -->
                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2 mb-2">
                        <p>Volume (0 – 1)</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full mt-2">
                        <Slider v-model="volumeArray" :max="1" :min="0" :step="0.1" :class="cn('w-full cursor-pointer')" />
                        <div class="flex text-muted-foreground text-sm mt-3 justify-between">
                            <span>Quiet</span>
                            <span>Loud</span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- ================= FOOTER ================ -->
            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.base64VoiceOutputVariable" />
            </template>
        </WorkflowBaseNode>
    </div>
</template>
