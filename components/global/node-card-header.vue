<script setup lang="ts">

const { nodeExecutionTimes } = useNodeExecutionStats()
defineProps<{
  nodeData: any
  id: string
}>()

const editMode = ref(false)
</script>

<template>
  <CardHeader v-bind="$attrs">
    <CardTitle class="text-white flex flex-row items-center justify-between">
      <div class="flex drag-header flex-row space-x-2 items-center">
        <div class="bg-card rounded-lg p-1">
          <NuxtIcon name="bx:chat" size="20" class="text-white" />
        </div>
        <div class="ml-2">
          <Input v-if="editMode" v-model="nodeData.title" class="w-60 nodrag nopan  dark" type="text" />
          <div v-else>
            {{ nodeData.title }}
          </div>
        </div>
      </div>

      <div class="bg-card cursor-pointer transition-all duration-200 rounded-lg p-1" :class="editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
        <NuxtIcon name="iconamoon:edit-light" size="20" class="text-white" @click.stop="editMode = !editMode" />
      </div>
    </CardTitle>

    <CardDescription class="mt-3 p-2 rounded-lg">
      <Textarea v-if="editMode" v-model="nodeData.description" class="w-full nodrag nopan text-white" placeholder="" />
      <div v-else class="text-[#D1D5DB]">
        {{ nodeData.description }}
      </div>
      <div class="  mt-2 flex items-center">
        <div v-if="id && nodeExecutionTimes[id]" class="  font-mono">
          <MDC :value="` ${nodeExecutionTimes[id]}`"></MDC>
        </div>
      </div>
    </CardDescription>
  </CardHeader>
</template>
