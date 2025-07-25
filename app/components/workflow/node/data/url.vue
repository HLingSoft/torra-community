<script lang="ts" setup>
import type { URLData } from '~~/types/node-data/url'


import { urlMeta } from '~~/types/node-data/url'


const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: URLData } | null>(null)





const { mini } = useMiniNode()



</script>

<template>
    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="urlMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.urlInputVariable" :description="`以 http/https 开头。例如:https://www.baidu.com`" />
                <!-- <div ref="urlInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.urlInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <EditTextDialog v-model:input-variable="currentNode.data.urlInputVariable" />
                    </div>
                    <div class="mt-3 text-xs text-muted-foreground">以 http/https 开头。例如:https://www.baidu.com</div>
                </div> -->



                <div v-show="!mini">
                    <div id="maxMessages" class="  flex w-full flex-row items-center space-x-2">
                        <p>Max Depth</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5">
                        <NumberField id="maxDepth" v-model="currentNode.data.maxDepth" :max="5" :min="1">

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
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />
            </template>
        </WorkflowBaseNode>

    </div>


</template>
