<script lang="ts" setup>
import type { ImageGenerateOpenAIDALLE3Data } from '~~/types/node-data/image-generate-openai-dalle3'

import { imageGenerateOpenAIMeta } from '~~/types/node-data/image-generate-openai-dalle3'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ImageGenerateOpenAIDALLE3Data } | null>(null)





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

const { mini } = useMiniNode()
</script>

<template>


    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="imageGenerateOpenAIMeta" @not-found="() => { }">
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

                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Size</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.size">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allSize" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Style</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.style">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allStyle" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Quality</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.quality">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in allQuality" :key="key" :value="value">{{ key }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.userInputInputVariable" />

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
