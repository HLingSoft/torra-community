<script lang="ts" setup>
import type { APIInputData } from '~~/types/node-data/api-input'


import { apiInputMeta } from '~~/types/node-data/api-input'
import type { KeyValueSchema } from '~~/types/workflow'




const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: APIInputData } | null>(null)




const inputValueIsOpen = ref(false)
const inputValueClonedData = ref<KeyValueSchema>({})
const saveInputData = () => {
    if (!currentNode.value) {
        return
    }

    currentNode.value.data!.inputValue = _.cloneDeep(inputValueClonedData.value)
    inputValueIsOpen.value = false
}
watch(inputValueIsOpen, (val) => {
    if (val) {
        inputValueClonedData.value = currentNode.value?.data?.inputValue || {}
        console.log('Input Value Cloned Data:', currentNode.value?.data?.inputValue, inputValueClonedData.value)

    } else {
        inputValueClonedData.value = {}
    }
}, { immediate: true })


const { mini } = useMiniNode()
</script>


<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="apiInputMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">

                <div v-show="!mini">
                    <div class="flex flex-row items-center space-x-2">
                        <p>Input Schema<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <Button variant="outline" class="w-full" @click.stop="inputValueIsOpen = true">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Open Table
                        </Button>
                    </div>
                </div>

            </template>

            <template #footer v-if="currentNode && currentNode.data">

                <!-- <div class="flex flex-col space-y-2"> -->
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.structuredOutputVariable" />

                <!-- <NodeCardOutputFooter v-model:output-variable="currentNode.data.messageOutputVariable" /> -->
                <!-- </div> -->
            </template>
        </WorkflowBaseNode>
        <Dialog v-model:open="inputValueIsOpen">
            <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="  flex flex-col  w-full !max-w-7xl h-[80vh]">
                <DialogHeader class="shrink-0">
                    <DialogTitle>
                        <div class="flex flex-row items-center space-x-2">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Input Schema
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Define the structure and data types of the API input parameters.
                    </DialogDescription>
                </DialogHeader>
                <div class="flex-1 overflow-auto">
                    <FunctionCallSchemaEditor v-model="inputValueClonedData" />

                </div>

                <DialogFooter class="w-full shrink-0 flex flex-row items-center justify-between">

                    <Button @click="saveInputData">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
