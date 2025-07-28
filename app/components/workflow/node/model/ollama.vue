<script lang="ts" setup>
import type { ChatOllamaData } from '~~/types/node-data/chat-ollama'

import { cn } from '@/lib/utils'
import { chatOllamaMeta } from '~~/types/node-data/chat-ollama'



const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: ChatOllamaData } | null>(null)





const temperatureArray = computed<number[]>({
    get: () => [currentNode.value?.data?.temperature ?? 0.2],
    set: (val) => {
        if (currentNode.value?.data) {
            currentNode.value.data.temperature = val[0]
        }
    },
})




const { mini } = useMiniNode()

</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="chatOllamaMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.modelNameInputVariable" />
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.baseURLInputVariable" />


                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputTextInputVariable" />
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.historyMessageInputVariable" :show-input="false" :handleBg="`var(--clr-messages)`" />
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.systemMessageInputVariable" />




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
