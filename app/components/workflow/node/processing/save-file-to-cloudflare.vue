<script lang="ts" setup>

import type { SaveToFileCloudflareData } from '~~/types/node-data/save-file-to-cloudflare'



import { saveToFileCloudflareMeta, EXT_MIME_MAP } from '~~/types/node-data/save-file-to-cloudflare'
const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: SaveToFileCloudflareData } | null>(null)

const { mini } = useMiniNode()

</script>


<template>

    <div>

        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="saveToFileCloudflareMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.accountIdInputPortVariable" />

                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.bucketInputPortVariable" />

                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.tokenInputPortVariable" />

                <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.publicUrlInputPortVariable" />

                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputInputVariable" :show-input="false" :handle-bg="`var(--clr-b64)`" />



                <div v-show="!mini" class="flex flex-col">
                    <div class="flex flex-row items-center space-x-2">
                        <p>File Type</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="mt-5 w-full">
                        <Select v-model="currentNode.data.fileType">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="File Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>

                                    <SelectItem v-for="(value, key) in EXT_MIME_MAP" :key="key" :value="value">{{ key.toUpperCase() }}</SelectItem>

                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </template>

            <template #footer v-if="currentNode && currentNode.data">


                <div class="flex flex-col space-y-2">
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" class="!rounded-b-none" />
                    <NodeCardOutputFooter v-model:output-variable="currentNode.data.toolOutputVariable" />
                </div>

            </template>
        </WorkflowBaseNode>

    </div>
</template>
