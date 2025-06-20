<script setup lang="ts">
import type { OutputPortVariable } from '~/types/workflow'
import { Handle, Position } from '@vue-flow/core'
import type { Connection } from '@vue-flow/core'

import type { InputPortVariable } from '~/types/workflow'

const outputVariableRef = defineModel<OutputPortVariable>('outputVariable')
onMounted(() => {
    if (outputVariableRef.value && !outputVariableRef.value.id) {
        outputVariableRef.value.id = nanoLowercaseAlphanumericId(10)
    }
})

const outputColor = computed(() => {
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Data') {
        return 'pink'
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Message') {
        return 'pink'
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Memory') {
        return 'oklch(66.6% 0.179 58.318)'
    }
    if (outputVariableRef.value &&( outputVariableRef.value.outputType === 'Tool' ||  outputVariableRef.value.outputType === 'Tools')) {
        return 'yellow'
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'LanguageModel') {
        return 'oklch(82.7% 0.119 306.383)'
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Embedding') {
        return 'oklch(88.2% 0.059 254.128)'
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Any') {
        return 'oklch(79.2% 0.209 151.711)'
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Base64') {
        return 'oklch(84.1% 0.238 128.85)'
    }
    if (outputVariableRef.value && outputVariableRef.value.outputType === 'Message[]') {
        return 'oklch(82.3% 0.12 346.018)'
    }


    return 'pink'
})

function isValidConnection(connection: Connection, { sourceNode, targetNode }) {

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
    if (sourceVar.outputType === 'Any') {
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
</script>
<template>

    <div class="bg-card rounded-b-lg py-2 pl-5 pr-10 flex  items-center justify-center relative">
        <div v-if="outputVariableRef && outputVariableRef.id" class="w-full h-full flex items-center justify-between">
            <NuxtIcon v-if="outputVariableRef.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="outputVariableRef.show = false" />
            <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="outputVariableRef.show = true" />
            <div class="flex flex-row items-center gap-2 text-sm ">
                <span class="text-muted-foreground"> {{ outputVariableRef.name }}</span><span>|</span>
                <span class="font-extrabold"> {{ outputVariableRef.outputType }}</span>

            </div>

            <Handle type="source" :is-valid-connection="isValidConnection" :id="outputVariableRef.id" :connectable-end="false" :position="Position.Right" :style="{ top: '20px', '--handle-bg': outputColor }" />
        </div>

    </div>
</template>
