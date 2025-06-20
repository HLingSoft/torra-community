<script lang="ts" setup>
import type { APIToolData, KeyValueRow } from '@/types/node-data/api-tool'


import { apiToolMeta } from '@/types/node-data/api-tool'


const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: APIToolData } | null>(null)





const methods = ref([

    { id: 'get', name: 'GET' },
    { id: 'post', name: 'POST' },


])

const bodyVariableIsOpen = ref(false)
const bodyVariableClonedData = ref<KeyValueRow[]>([])

const saveBodyVariable = () => {
    if (!currentNode.value) return

    currentNode.value.data!.bodyInputVariable.value = _.cloneDeep(bodyVariableClonedData.value)
    bodyVariableIsOpen.value = false
}
watch(bodyVariableIsOpen, (val) => {
    if (val) {
        console.log('bodyVariableIsOpen', currentNode.value?.data?.bodyInputVariable.value)
        const raw: KeyValueRow[] = currentNode.value?.data?.bodyInputVariable.value || []
        bodyVariableClonedData.value = raw.map((item, i) => ({
            id: item.id ?? i + 1,
            key: item.key,
            value: item.value,
            selected: false,
            description: item.description ?? '',
            type: item.type ?? 'string',
        }))
    }
}, { immediate: true })


</script>

<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="apiToolMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <div ref="toolNameInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.toolNameInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <!-- <EditTextDialog class="w-full" :disabled="currentNode.data.toolNameVariable.connected" :model-value="currentNode.data.toolNameVariable.value || ''" placeholder="" @save="(val) => currentNode!.data!.toolNameVariable.value = val" /> -->
                        <EditTextDialog v-bind:input-variable="currentNode.data.toolNameInputVariable" />
                    </div>
                    <div class="mt-3 text-xs text-muted-foreground">必须是纯英文、下划线、小写字母组成的。</div>
                </div>

                <div ref="toolDescriptionInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.toolDescriptionInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <!-- <EditTextDialog class="w-full" :disabled="currentNode.data.toolDescriptionVariable.connected" :model-value="currentNode.data.toolDescriptionVariable.value || ''" placeholder="" @save="(val) => currentNode!.data!.toolDescriptionVariable.value = val" /> -->
                        <EditTextDialog v-bind:input-variable="currentNode.data.toolDescriptionInputVariable" />
                    </div>

                </div>

                <div ref="urlInputVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.urlInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <!-- <EditTextDialog class="w-full" :disabled="currentNode.data.urlInputVariable.connected" :model-value="currentNode.data.urlInputVariable.value || ''" placeholder="请输入地址" @save="(val) => currentNode!.data!.urlInputVariable.value = val" /> -->
                        <EditTextDialog v-bind:input-variable="currentNode.data.urlInputVariable" />
                    </div>
                    <div class="mt-3 text-xs text-muted-foreground">以 http/https 开头。例如:https://www.baidu.com</div>
                </div>

                <div ref="tokenVariableRef">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.tokenInputVariable.name }}</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <!-- <EditTextDialog class="w-full" :disabled="currentNode.data.tokenVariable.connected" :model-value="currentNode.data.tokenVariable.value || ''" placeholder="请输入Token" @save="(val) => currentNode!.data!.tokenVariable.value = val" /> -->
                        <EditTextDialog v-bind:input-variable="currentNode.data.tokenInputVariable" />
                    </div>
                    <div class="mt-3 text-xs text-muted-foreground"></div>
                </div>


                <div class="w-full">
                    <div class="flex flex-row items-center space-x-2 w-full">
                        <p>Method</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full flex items-center justify-between  mt-4">
                        <Select v-model="currentNode.data.methodType" class="w-full">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a model name" />
                            </SelectTrigger>
                            <SelectContent class="w-full dark" teleport="body">
                                <SelectGroup>
                                    <SelectItem v-for="method in methods" :key="method.id" :value="method.id">
                                        {{ method.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>



                <div v-if="currentNode.data.methodType !== 'get'">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.bodyInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <Button :disabled="currentNode.data.bodyInputVariable.connected" variant="outline" class="w-full" @click.stop="bodyVariableIsOpen = true">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Open Table
                        </Button>
                    </div>
                </div>

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.toolOutputVariable" />
            </template>
        </WorkflowBaseNode>
        <Dialog v-model:open="bodyVariableIsOpen">
            <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="dark  flex flex-col text-white w-full !max-w-7xl h-[80vh]">
                <DialogHeader class="shrink-0">
                    <DialogTitle>
                        <div class="flex flex-row items-center space-x-2">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Body
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Edit text content.
                    </DialogDescription>
                </DialogHeader>
                <div class="flex-1 overflow-auto">
                    <ApiToolSchema class="h-full" v-model="bodyVariableClonedData" />
                </div>

                <DialogFooter class="w-full shrink-0 flex flex-row items-center justify-between">

                    <Button @click="saveBodyVariable">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>


</template>
