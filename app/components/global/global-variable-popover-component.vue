<script lang="ts" setup>
import type { InputPortVariable } from '~~/types/workflow';
defineProps<{ placeholder?: string }>()
const inputVariableRef = defineModel<InputPortVariable>('inputPortVariable')

const { mini } = useMiniNode()
</script>


<template>
    <div v-if="inputVariableRef">
        <div v-show="!mini" class="flex flex-row items-center space-x-2">
            <p>{{ inputVariableRef.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div :class="{ 'mt-5': !mini }" class="w-full  ">
            <GlobalVariablePopover class="w-full" v-model:inputVariable="inputVariableRef" :placeholder="placeholder" />

        </div>
    </div>
</template>
