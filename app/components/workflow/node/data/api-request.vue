<script lang="ts" setup>
import type { APIRequestData } from '~~/types/node-data/api-request'
import { apiRequestMeta } from '~~/types/node-data/api-request'


const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: APIRequestData } | null>(null)




const methods = ref([

    { id: 'get', name: 'GET' },
    { id: 'post', name: 'POST' },


])

const bodyVariableIsOpen = ref(false)
const bodyVariableClonedData = ref<Record<string, string>>({})
const saveBodyVariable = () => {
    if (!currentNode.value) {
        return
    }
    currentNode.value.data!.bodyInputVariable.value = bodyVariableClonedData.value
    bodyVariableIsOpen.value = false
}
watch(bodyVariableIsOpen, (val) => {
    if (val) {
        bodyVariableClonedData.value = currentNode.value?.data?.bodyInputVariable.value || []
    } else {
        bodyVariableClonedData.value = {}
    }
}, { immediate: true })



const { mini } = useMiniNode()

</script>

<template>
    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="apiRequestMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.urlInputVariable" :description="`以 http/https 开头。例如:https://www.baidu.com`" />


                <div v-show="!mini" class="w-full">
                    <div class="flex flex-row items-center space-x-2 w-full">
                        <p>Method</p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full flex items-center justify-between  mt-4">
                        <Select v-model="currentNode.data.methodType" class="w-full">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select a model name" />
                            </SelectTrigger>
                            <SelectContent teleport="body">
                                <SelectGroup>
                                    <SelectItem v-for="method in methods" :key="method.id" :value="method.id">
                                        {{ method.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <EditTextDialogComponent v-if="currentNode.data.methodType !== 'get'" class="w-full" v-model:inputPortVariable="currentNode.data.tokenInputVariable" />



                <EditTextDialogComponent v-if="currentNode.data.methodType !== 'get'" class="w-full" v-model:inputPortVariable="currentNode.data.bodyInputVariable" />


                <Button v-show="!mini" :disabled="currentNode.data.bodyInputVariable.connected" variant="outline" class="w-full" @click.stop="bodyVariableIsOpen = true">
                    <NuxtIcon name="mdi-light:table" size="20" />
                    Open Table
                </Button>


            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.dataOutputVariable" />
            </template>
        </WorkflowBaseNode>
        <Dialog v-model:open="bodyVariableIsOpen">
            <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="   flex flex-col  w-full !max-w-7xl h-[80vh]">
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

                    <KeyValueEditor class="h-full" v-model="bodyVariableClonedData" />
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
