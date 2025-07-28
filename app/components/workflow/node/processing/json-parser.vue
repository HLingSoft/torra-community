<script lang="ts" setup>
import type { JSONParserData } from '~~/types/node-data/json-parser'


import { jsonParserMeta } from '~~/types/node-data/json-parser'


type KeyValueSchema = Record<
    string,
    {
        name: string
        description: string
        type: string
        defaultValue: any  // ✅ 要求这个字段
    }
>

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: JSONParserData } | null>(null)


const outputSchemaIsOpen = ref(false)
const outputSchemaClonedData = ref<KeyValueSchema>({})
const saveoutputSchema = () => {
    if (!currentNode.value) {
        return
    }
    currentNode.value.data!.outputSchemaInputVariable.value = outputSchemaClonedData.value
    outputSchemaIsOpen.value = false
}
watch(outputSchemaIsOpen, (val) => {
    if (val) {
        outputSchemaClonedData.value = currentNode.value?.data?.outputSchemaInputVariable.value || []
    } else {
        outputSchemaClonedData.value = {}
    }
}, { immediate: true })

const { mini } = useMiniNode()

</script>



<template>

    <div>
        <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="jsonParserMeta" @not-found="() => { }">
            <template #content v-if="currentNode && currentNode.data">
                <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.inputMessageInputVariable" />



                <div v-show="!mini">
                    <div class="flex flex-row items-center space-x-2">
                        <p>{{ currentNode.data.outputSchemaInputVariable.name }}<span class="text-red-500">*</span></p>
                        <NuxtIcon name="clarity:info-line" size="20" />
                    </div>
                    <div class="w-full  mt-5">
                        <Button :disabled="currentNode.data.outputSchemaInputVariable.connected" variant="outline" class="w-full" @click.stop="outputSchemaIsOpen = true">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Open Table
                        </Button>
                    </div>
                </div>

            </template>

            <template #footer v-if="currentNode && currentNode.data">
                <NodeCardOutputFooter v-model:output-variable="currentNode.data.structuredOutputVariable" />

            </template>
        </WorkflowBaseNode>
        <Dialog v-model:open="outputSchemaIsOpen">
            <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="  flex flex-col w-full !max-w-7xl h-[80vh]">
                <DialogHeader class="shrink-0">
                    <DialogTitle>
                        <div class="flex flex-row items-center space-x-2">
                            <NuxtIcon name="mdi-light:table" size="20" />
                            Output Schema
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Define the structure and data types for the model's output.
                    </DialogDescription>
                </DialogHeader>
                <div class="flex-1 overflow-auto">
                    <FunctionCallSchemaEditor v-model="outputSchemaClonedData" />

                </div>

                <DialogFooter class="w-full shrink-0 flex flex-row items-center justify-between">

                    <Button @click="saveoutputSchema">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
</template>
