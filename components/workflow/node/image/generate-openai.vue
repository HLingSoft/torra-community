<script lang="ts" setup>
import type { ImageGenerateOpenAIData } from '@/types/node-data/image-generate-openai'

import { imageGenerateOpenAIMeta } from '@/types/node-data/image-generate-openai'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ImageGenerateOpenAIData } | null>(null)





const allSize = {
    '1024x1024': '1024x1024',
    '1792x1024': '1792x1024',
    '1024x1792': '1024x1792',
}
const allStyle = {
    'Natural': 'natural',
    'Vivid': 'vivid',

}
const allQuality = {
    'Standard': 'standard',
    'HD': 'hd',
}
</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="imageGenerateOpenAIMeta" @not-found="() => { }">
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
                        <p>Size</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.size">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent class="dark">
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allSize" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Style</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.style">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent class="dark">
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allStyle" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Quality</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.quality">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent class="dark">
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allQuality" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <!-- <div class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.imageDataInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <div class="mt-5 w-full">
                        <EditTextDialog v-model:input-variable="currentNode.data.imageDataInputVariable" :show-input="false" :handleBg="`oklch(82.7% 0.119 306.383)`" />
                    </div>
                    <p class="text-muted-foreground text-sm mt-2">*支持图片链接或 Base64 格式，均可为数组</p>
                    <p class="text-muted-foreground text-sm mt-1">*作为工具（Tool）输出时，该字段由 Agent 自动提供，无需手动填写</p>
                </div> -->

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

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.base64ImageOutputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.toolOutputVariable" />

                </div>
            </template>
        </WorkflowBaseNode>
    </div>
</template>
