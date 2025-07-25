<script lang="ts" setup>
import type { ChatDeepSeekData } from '~~/types/node-data/chat-deepseek'

import { cn } from '@/lib/utils'
import { chatDeepSeekMeta } from '~~/types/node-data/chat-deepseek'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ChatDeepSeekData } | null>(null)





const temperatureArray = computed<number[]>({
    get: () => [currentNode.value?.data?.temperature ?? 0.2],
    set: (val) => {
        if (currentNode.value?.data) {
            currentNode.value.data.temperature = val[0]
        }
    },
})

const llms = [

    { id: 'deepseek-chat', name: 'deepseek-chat' },
    { id: 'deepseek-reasoner', name: 'deepseek-reasoner' }

]


const { mini } = useMiniNode()

</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="chatDeepSeekMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputTextInputVariable" />
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.historyMessageInputVariable" :show-input="false" :handleBg="`var(--clr-messages)`" />
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.systemMessageInputVariable" />


                <div v-show="!mini" class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Stream</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>

                    <Switch v-model="currentNode.data.streaming" />
                </div>

                <div v-show="!mini" class="w-full">
                    <div class="flex flex-row items-center space-x-2 w-full">
                        <p>Model Name</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full flex items-center justify-between  mt-4">
                        <Select v-model="currentNode.data.modelName" class="w-full">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a model name" />
                            </SelectTrigger>
                            <SelectContent telepor="body">
                                <SelectGroup>
                                    <SelectItem v-for="llm in llms" :key="llm.id" :value="llm.id">
                                        {{ llm.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.apiKeyInputVariable" />

                <div v-show="!mini">
                    <div class="flex flex-row items-center justify-between space-x-2">
                        <div class="flex flex-row items-center space-x-2">
                            <p>Temperature</p>
                            <NuxtIcon name="clarity:info-line" size="20" />
                        </div>
                        <div class="font-mono ">
                            {{ currentNode.data.temperature }}
                        </div>
                    </div>
                    <div class="w-full  mt-5">
                        <Slider v-model="temperatureArray" :max="1" :min="0" :step="0.1" :class="cn('w-full cursor-pointer', $attrs.class ?? '')" />
                        <div class="flex text-muted-foreground text-sm mt-3 justify-between">
                            <span>Precise</span>
                            <span>Creative</span>
                        </div>
                    </div>
                </div>
            </template>

            <template #footer v-if="currentNode && currentNode.data">

                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.messageOutputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.languageModelOutputVariable" />
                </div>


            </template>
        </WorkflowBaseNode>

    </div>
</template>
