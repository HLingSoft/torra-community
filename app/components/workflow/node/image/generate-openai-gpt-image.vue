<script lang="ts" setup>
import type { ImageGenerateOpenAIGptImageData } from '~~/types/node-data/image-generate-openai-gpt-image'
import { imageGenerateOpenAIGptImageMeta } from '~~/types/node-data/image-generate-openai-gpt-image'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string; data: ImageGenerateOpenAIGptImageData } | null>(null)

// 下拉选项映射
const allSizes = {
    Auto: 'auto',
    '1024×1024': '1024x1024',
    '1536×1024': '1536x1024',
    '1024×1536': '1024x1536'
}
const allBackgrounds = {
    Auto: 'auto',
    Transparent: 'transparent',
    Opaque: 'opaque'
}
const allModerations = {
    Auto: 'auto',
    Low: 'low'
}
const allFormats = {
    PNG: 'png',
    JPEG: 'jpeg',
    WebP: 'webp'
}
const allQualities = {
    Auto: 'auto',
    Low: 'low',
    Medium: 'medium',
    High: 'high'
}
watch(
    () => currentNode.value?.data.format,
    (newFormat) => {
        if (newFormat === 'png' && currentNode.value) {
            currentNode.value.data.compression = 100
        }
    }
)

const { mini } = useMiniNode()
</script>

<template>
    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="imageGenerateOpenAIGptImageMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <!-- API Key -->
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.apiKeyInputVariable" />
                <!-- <div class="flex flex-col ">

                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.apiKeyInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover v-model:inputVariable="currentNode.data.apiKeyInputVariable" />
                    </div>

                </div> -->

                <!-- Base URL -->
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.baseURLInputVariable" />
                <!-- <div class="flex flex-col ">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.baseURLInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <GlobalVariablePopover v-model:inputVariable="currentNode.data.baseURLInputVariable" />
                    </div>

                </div> -->
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.promptInputVariable" />
                <!-- Prompt -->
                <!-- <div class="flex flex-col ">
                    <div class="flex flex-col ">
                        <div class="flex flex-row items-center space-x-2">
                            <p>{{ currentNode.data.promptInputVariable.name }}</p>
                            <NuxtIcon name="clarity:info-line" size="20" />
                        </div>
                        <div class="mt-5 w-full">
                            <EditTextDialog v-model:inputVariable="currentNode.data.promptInputVariable" />
                        </div>

                    </div>


                </div> -->

                <!-- Number of Images -->
                <div v-show="!mini" class="flex flex-col ">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Count</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <div class="mt-5">
                        <NumberField id="count" v-model="currentNode.data.count" :max="10" :min="1">

                            <NumberFieldContent>
                                <NumberFieldDecrement />
                                <NumberFieldInput />
                                <NumberFieldIncrement />
                            </NumberFieldContent>
                        </NumberField>
                    </div>

                </div>


                <div v-show="!mini" class="flex flex-col ">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Background</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <div class="mt-5">
                        <Select v-model="currentNode.data.background">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Background" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="(v, k) in allBackgrounds" :key="k" :value="v">
                                        {{ k }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <!-- Moderation -->
                <div v-show="!mini" class="flex flex-col ">

                    <div class="flex flex-row items-center space-x-2">
                        <p>Moderation</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5">
                        <Select v-model="currentNode.data.moderation">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Moderation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="(v, k) in allModerations" :key="k" :value="v">
                                        {{ k }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <!-- Output Format -->
                <div v-show="!mini" class="flex flex-col ">

                    <div class="flex flex-row items-center space-x-2">
                        <p>Format</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5">
                        <Select v-model="currentNode.data.format">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="(v, k) in allFormats" :key="k" :value="v">
                                        {{ k }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <!-- Quality -->
                <div v-show="!mini" class="flex flex-col ">


                    <div class="flex flex-row items-center space-x-2">
                        <p>Quality</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5">
                        <Select v-model="currentNode.data.quality">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Quality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="(v, k) in allQualities" :key="k" :value="v">
                                        {{ k }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <!-- Size -->
                <div v-show="!mini" class="flex flex-col ">

                    <div class="flex flex-row items-center space-x-2">
                        <p>Size</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5">
                        <Select v-model="currentNode.data.size">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="(v, k) in allSizes" :key="k" :value="v">
                                        {{ k }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                <div v-show="!mini" class="flex flex-col ">

                    <div class="flex flex-row items-center space-x-2">
                        <p>Compression</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5">
                        <NumberField id="compression" v-model="currentNode.data.compression" :max="100" :min="0" :disabled="currentNode.data.format === 'png'">

                            <NumberFieldContent>
                                <NumberFieldDecrement />
                                <NumberFieldInput />
                                <NumberFieldIncrement />
                            </NumberFieldContent>
                        </NumberField>
                    </div>
                </div>
            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.base64ImageOutputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.singlebase64ImageOutputVariable" />
                </div>

            </template>
        </WorkflowBaseNode>
    </div>
</template>
