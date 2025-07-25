<script setup lang="ts">
import type { OutputPortVariable } from '~~/types/workflow'
import { Handle, Position } from '@vue-flow/core'
import type { Connection, GraphNode } from '@vue-flow/core'
import type { InputPortVariable } from '~~/types/workflow'

const { t } = useI18n()
const outputVariableRef = defineModel<OutputPortVariable>('outputVariable')
onMounted(() => {
    if (outputVariableRef.value && !outputVariableRef.value.id) {
        outputVariableRef.value.id = nanoLowercaseAlphanumericId(10)
    }
})

const outputColor = computed(() => {
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Data') {
        return outputTypeColorVar['Data']
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Message') {
        return outputTypeColorVar['Message']
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Memory') {
        return outputTypeColorVar['Memory']
    }
    if (outputVariableRef.value && (outputVariableRef.value.outputType === 'Tool' || outputVariableRef.value.outputType === 'Tools')) {
        return outputTypeColorVar['Tool']
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'LanguageModel') {
        return outputTypeColorVar['LanguageModel']
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Embedding') {
        return outputTypeColorVar['Embedding']
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Any') {
        return outputTypeColorVar['Any']
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Base64') {
        return outputTypeColorVar['Base64']
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Message[]') {
        return outputTypeColorVar['Message[]']
    }


    return 'pink'
})

function isValidConnection(connection: Connection, { sourceNode, targetNode }: { sourceNode: GraphNode; targetNode: GraphNode }) {

    const sourceHandle = connection.sourceHandle
    const targetHandle = connection.targetHandle

    const outputCandidates: OutputPortVariable[] = Object.values(sourceNode.data)
        .flatMap(v => (Array.isArray(v) ? v : [v]))
        .filter(
            (v): v is OutputPortVariable =>
                v && typeof v === 'object' && 'id' in v && 'outputType' in v,
        )
    const sourceVar = outputCandidates.find(v => v.id === sourceHandle)
    if (!sourceVar) {
        return false
    }
    if (sourceVar.outputType === 'Any' || sourceVar.outputType === 'Any[]') {
        return true
    }



    const inputCandidates: InputPortVariable[] = Object.values(targetNode.data)
        .flatMap(v => (Array.isArray(v) ? v : [v]))
        .filter(
            (v): v is InputPortVariable =>
                v && typeof v === 'object' && 'id' in v && 'allowedTypes' in v,
        )
    const targetVar = inputCandidates.find(v => v.id === targetHandle)


    if (!targetVar) {
        return false
    }
    if (targetVar.allowedTypes.includes('Any')) {
        return true
    }

    return targetVar.allowedTypes.includes(sourceVar.outputType)
}
const { mini } = useMiniNode()
const handleStyle = computed<Record<string, string>>(() => {
    // :style="{ top: '20px', '--handle-bg': outputColor }"
  const base: Record<string, string> = {
    // left: '-25px'
  }
   if(outputColor.value){
   base['--handle-bg'] =outputColor.value
   }
 
 
  base.top = mini.value ? '44px' : '20px'
  return base
})
</script>
<template>

    <div :class="{' rounded-b-lg py-2 pl-5 pr-10 flex   items-center justify-center relative bg-accent':!mini}">
        <div v-if="outputVariableRef && outputVariableRef.id" class="w-full h-full flex items-center justify-between">
            <div></div>
            <!-- <NuxtIcon v-if="outputVariableRef.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="outputVariableRef.show = false" />
            <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="outputVariableRef.show = true" /> -->
            <div v-show="!mini" class="flex flex-row items-center gap-2 text-sm ">
                <span class="text-muted-foreground"> {{ t(outputVariableRef.name) }}</span><span>|</span>
                <span class="font-extrabold"> {{ outputVariableRef.outputType }}</span>

            </div>

            <Handle  type="source" :is-valid-connection="isValidConnection" :id="outputVariableRef.id" :connectable-end="false" :position="Position.Right"  :style="handleStyle"  />
        </div>

    </div>

</template>
