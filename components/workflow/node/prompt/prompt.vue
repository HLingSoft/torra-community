<script lang="ts" setup>
import type { PromptTemplateData } from '@/types/node-data/prompt-template'
import type { InputPortVariable } from '~/types/workflow'
import { promptTemplateMeta } from '@/types/node-data/prompt-template'

const props = defineProps<{ id: string }>()
const inputVariables = ref<InputPortVariable[]>([])
const variableRefs = ref<Record<string, HTMLElement | undefined>>({})
const currentNode = ref<{ id: string, data: PromptTemplateData } | null>(null)
const { edges } = storeToRefs(useWorkflowStore())

watchDebounced(
  () => currentNode.value?.data?.template,
  () => {
    if (!currentNode.value) return

    const template = currentNode.value.data.template
    if (!template) return

    // 提取模板中使用到的变量名
    const newNamesSet = new Set(
      [...template.matchAll(/\{(.*?)\}/g)].map(m => m[1])
    )

    const oldVars = currentNode.value.data.inputVariables
    const oldMap = Object.fromEntries(oldVars.map(v => [v.name, v]))

    // 创建新的变量列表（新增或保留）
    const updatedVars: InputPortVariable[] = Array.from(newNamesSet).map(name => {
      const old = oldMap[name]
      return {
        name,
        id: old?.id ?? nanoLowercaseAlphanumericId(10),
        value: old?.value ?? '',
        connected: old?.connected ?? false,
        allowedTypes: ['Data'],

      }
    })

    const removedHandleIds = oldVars
      .filter(v => !newNamesSet.has(v.name))
      .map(v => `${v.id}`)  // 🔧 关键改动

    edges.value = edges.value.filter(edge => {
      const target = edge.targetHandle
      return !(target && removedHandleIds.includes(target))
    })





    // 赋值新列表，自动移除多余变量
    currentNode.value.data.inputVariables = updatedVars
    inputVariables.value = updatedVars


  },
  { immediate: true, debounce: 500, deep: true }
)
const variableMap = computed(() => {
  return Object.fromEntries(
    currentNode.value?.data.inputVariables.map(v => [v.id, v]) ?? []
  )
})


</script>

<template>
  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="promptTemplateMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>Template</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full mt-5">
            <WorkflowNodePromptVariableEdit v-model="currentNode.data.template" :placeholder="'请输入提示词模板'" class="w-full" @save="(val) => currentNode!.data.template = val" />
          </div>
        </div>

        <div class="flex flex-col space-y-8">
          <div v-for="variable in currentNode.data.inputVariables" :ref="el => variableRefs[variable.id] = el as HTMLElement" :key="variable.id">
            <div class="flex flex-row items-center space-x-2">
              <p>{{ variable.name }}</p>
            </div>
            <div class="w-full mt-5">
              <EditTextDialog class="w-full" placeholder="请输入字段名称" v-model:inputVariable="variableMap[variable.id]" />
            </div>
          </div>
        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <div class="flex flex-col space-y-2">
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" class="!rounded-b-none" />
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.promptOutputVariable" />
        </div>
      </template>
    </WorkflowBaseNode>
  </div>
</template>
