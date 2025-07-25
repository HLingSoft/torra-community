<script setup lang="ts">
const { t } = useI18n()
const { nodeExecutionTimes } = useNodeExecutionStats()

defineProps<{
  nodeData: any
  id: string
}>()
// const { mini } = useMiniNode()
const editMode = ref(false)
</script>

<template>
  <CardHeader v-bind="$attrs" class="-mx-2 ">
    <CardTitle class=" flex flex-row items-center justify-between">
      <div class="flex drag-header flex-row space-x-2 items-center">
        <div class="bg-card rounded-lg p-1">

          <NuxtIcon v-if="nodeData.icon && !nodeData.icon.startsWith('https://')" :name="nodeData.icon" size="28" class="text-primary" />
          <img v-else-if="nodeData.icon && nodeData.icon.startsWith('https://')" :src="nodeData.icon" alt="Node Icon" class="w-6 h-6 rounded-lg" />
        </div>
        <div class="ml-2">
          <Input v-if="editMode" v-model="nodeData.title" class="w-60 nodrag nopan  " type="text" />
          <div v-else>
            {{ t(nodeData.title) }}
          </div>
        </div>
      </div>

      <div class="bg-card cursor-pointer transition-all duration-200 rounded-lg p-1" :class="editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
        <NuxtIcon name="iconamoon:edit-light" size="20" class="" @click.stop="editMode = !editMode" />
      </div>
    </CardTitle>

    <CardDescription class=" px-2    rounded-lg">
      <Textarea v-if="editMode" v-model="nodeData.description" class="w-full nodrag nopan" placeholder="" />
      <div v-else class=" ">
        {{ t(nodeData.description) || 'No description provided.' }}

      </div>
      <div class="    flex items-center">
        <div v-if="id && nodeExecutionTimes[id]" class="  font-mono">

          <MDC :value="` ${nodeExecutionTimes[id]}`"></MDC>
        </div>
      </div>
    </CardDescription>
  </CardHeader>
</template>
