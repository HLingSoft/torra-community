<script lang="ts" setup>
import type { InputPortVariable } from '~~/types/workflow';

withDefaults(defineProps<{

    placeholder?: string
    showInput?: boolean
    handleBg?: string  // 新增
    description?: string
}>(), {
    showInput: true,
    placeholder: 'Typing something'
})
const inputPortVariable = defineModel<InputPortVariable>('inputPortVariable')
const { mini } = useMiniNode()
</script>


<template>
    <div v-if="inputPortVariable">
        <div v-show="!mini" class="flex flex-row items-center space-x-2">
            <p>{{ inputPortVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div :class="{ 'mt-5': !mini }" class="w-full  ">
            <EditTextDialog v-model:input-variable="inputPortVariable" :placeholder="placeholder" :show-input="showInput" :handle-bg="handleBg" />



        </div>
        <p v-if="description && !mini" class="text-muted-foreground text-sm mt-1.5">{{ description }}</p>
    </div>
</template>
