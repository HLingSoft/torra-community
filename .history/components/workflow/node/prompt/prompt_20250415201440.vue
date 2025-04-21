<script lang="ts" setup>
import type { PromptTemplateData } from '@/types/node-data/prompt-template'
import type { InputPortVariable } from '~/types/workflow'
import { createPortManager } from '@/components/workflow/useNodePorts'

import { promptTemplateMeta } from '@/types/node-data/prompt-template'
// const { nodeExecutionTimes } = useNodeExecutionStats()
const props = defineProps<{ id: string }>()

// const editMode = ref(false)
const template = ref('')
const inputVariables = ref<InputPortVariable[]>([])
const variableRefs = ref<Record<string, HTMLElement | undefined>>({})
// const variablePortMap = ref<Record<string, string>>({})
const footer = ref<HTMLElement | null>(null)

const currentNode = ref<{ id: string, data?: PromptTemplateData & { show?: boolean } } | undefined>()
const { addInputPort, addOutputPort, updateNodePosition, removeOutputPort } = createPortManager()
const { nodes, edges } = storeToRefs(useWorkflowStore())
// const { onNodeClick } = useVueFlow()

onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  node.data = {
    ...promptTemplateMeta,
    ...node.data,
  } as PromptTemplateData

  currentNode.value = node
  template.value = node.data.template

  inputVariables.value = node.data.inputVariables.map((v) => {
    return {
      ...v,
      id: v.id || nanoLowercaseAlphanumericId(10),
      connected: v.connected || false,
      allowedTypes: v.allowedTypes || ['Message'],
    }
  })

  await nextTick()

  if (footer.value) {
    if (!node.data.saved) {
      const y = footer.value.offsetTop + footer.value.clientHeight / 2 
      const id = nanoLowercaseAlphanumericId(10)

      node.data.outputVariable.id = id
      addOutputPort(props.id, id, 'pink', y)
    }
  }
})

watch(edges, () => {
  console.log('prompt.vue edges', edges.value)
  if (!currentNode.value?.data) {
    return
  }
  currentNode.value.data.inputVariables.forEach((v: InputPortVariable) => {
    v.connected = edges.value.some(edge => edge.target === v.id)
    console.log('v.connected', v.name, v.connected)
  })
}, { deep: true, immediate: true })

watch(template, async () => {
  if (!currentNode.value?.data) {
    return
  }

  const nodeId = currentNode.value.id
  const newNames = [...template.value.matchAll(/\{(.*?)\}/g)].map(m => m[1])
  const oldVars = currentNode.value.data.inputVariables
  const oldMap = Object.fromEntries(oldVars.map(v => [v.name, v]))

  // 1. 处理被移除的变量
  const removed = oldVars.filter(v => !newNames.includes(v.name))
  removed.forEach(v => removeOutputPort(v.id))

  // 2. 生成新的 inputVariables
  const updatedVars: InputPortVariable[] = newNames.map((name) => {
    const old = oldMap[name]
    return {
      name,
      id: old?.id || nanoLowercaseAlphanumericId(10),
      value: old?.value ?? '',
      connected: old?.connected ?? false,
      allowedTypes: ['Message'],
    }
  })

  // 3. 更新 currentNode & local ref
  currentNode.value.data.inputVariables = updatedVars
  inputVariables.value = updatedVars

  await nextTick()

  // 4. 更新端口位置
  updatedVars.forEach((v) => {
    const el = variableRefs.value[v.name]
    const y = el?.offsetTop ? el.offsetTop + el.clientHeight / 2 : 0

    if (!oldMap[v.name]) {
      addInputPort(nodeId, v.id, 'aquamarine', y)
    }
    else {
      updateNodePosition(v.id, y)
    }
  })

  // 更新 outputPort 位置
  if (footer.value && currentNode.value.data.outputVariable.id) {
    const y = footer.value.offsetTop + footer.value.clientHeight / 2 + 4
    updateNodePosition(currentNode.value.data.outputVariable.id, y)
  }
})
const checkAndSave = async () => {
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.template = template.value
  // 变量已经由 watcher 自动处理，无需重复更新
}
const editVariableTextValueComponent = ref(false)
const currentEditVariable = ref<InputPortVariable | null>(null)
const editVariableTextValue = (variable: InputPortVariable) => {
  currentEditVariable.value = _.cloneDeep(variable)
  editVariableTextValueComponent.value = true
}
const saveEditVariableTextValue = () => {
  if (!currentNode.value?.data) {
    return
  }
  // 找到具有相同名字的变量
  const found = currentNode.value.data.inputVariables.find(v => v.name === currentEditVariable.value?.name)
  if (found) {
    found.value = currentEditVariable.value!.value
  }
  editVariableTextValueComponent.value = false
}
</script>

<template>
  <Card
    v-if="currentNode && currentNode.data"
    class="!pb-0 w-96 text-white bg-[#18181B] rounded-lg group flex flex-col focus:outline-none focus:shadow-lg focus:shadow-[#000000]  focus:border focus:border-[#27272A]"
  >
      <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
    <!-- <CardHeader>
      <CardTitle class="text-white flex flex-row items-center justify-between">
        <div class="flex flex-row space-x-2 items-center">
          <div class="bg-[#27272A] rounded-lg p-1">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="">
            <Input
              v-if="editMode"
              v-model="currentNode.data.title"
              class="w-60 nodrag nopan"
              type="text"
            />
            <div v-else>
              {{ currentNode.data.title }}
            </div>
          </div>
        </div>

        <div
          class="bg-[#27272A] cursor-pointer transition-all duration-200 rounded-lg p-1"
          :class="editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        >
          <NuxtIcon
            name="iconamoon:edit-light"
            size="20"
            class="text-white"
            @click.stop="editMode = !editMode"
          />
        </div>
      </CardTitle>

      <CardDescription class="  p-2 rounded-lg">
        <Input
          v-if="editMode"
          v-model="currentNode.data.description"
          class="w-full nodrag nopan text-white"
          type="text"
        />
        <div v-else class="text-[#D1D5DB]">
          {{ currentNode.data.description }}
        </div>
        <div class="h-5 flex items-center">
          <div v-if="props.id && nodeExecutionTimes[props.id]" class="  text-green-300 font-mono">
            ⏱️ 耗时：{{ nodeExecutionTimes[props.id] }}
          </div>
        </div>
      </CardDescription>
    </CardHeader> -->

    <CardContent class="text-white space-y-8 -mt-8 flex-1">
      <Separator class="my-5" />
      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>Template</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full mt-5">
          <AlertDialog>
            <AlertDialogTrigger class="w-full">
              <div class="relative w-full">
                <Input v-model="currentNode.data.template" disabled class="w-full" type="text" placeholder="请输入提示词模板" />
                <NuxtIcon
                  name="solar:full-screen-broken"
                  size="18"
                  class="absolute z-10 right-2 bottom-2 cursor-pointer"
                />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent class="dark text-white w-full !max-w-7xl ">
              <AlertDialogHeader>
                <AlertDialogTitle class="text-base">
                  Edit Prompt
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Create your prompt. Prompts can help guide the behavior of a Language Model. Use curly brackets {} to introduce inputVariables.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div>
                <Textarea
                  v-model="template"
                  class="w-full h-[60vh] resize-none"
                  placeholder="请输入提示词模板"
                />
              </div>
              <AlertDialogFooter class="w-full flex flex-row items-center justify-between">
                <div class="w-full flex flex-col">
                  <AlertDialogTitle class="text-base">
                    {} Prompt Variables:<span v-for="variable in inputVariables" :key="variable.name" class="text-white bg-gray-700 rounded-full px-2 py-1 mx-1 ">{{ variable.name }}</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Prompt inputVariables can be created with any chosen name inside curly brackets, e.g. {variable_name}
                  </AlertDialogDescription>
                </div>
                <div class="flex flex-row space-x-2  ">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction @click="checkAndSave">
                    Check&Save
                  </AlertDialogAction>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div class="flex flex-col space-y-8">
        <div
          v-for="variable in currentNode.data.inputVariables"
          :ref="el => variableRefs[variable.name] = el as HTMLElement"
          :key="variable.name"
        >
          <div class="flex flex-row items-center space-x-2">
            <p>{{ variable.name }}</p>
          </div>
          <div class="w-full mt-5">
            <div v-if="!variable.connected" class="relative">
              <Input v-model="variable.value" class="w-full" type="text" placeholder="" />

              <NuxtIcon
                name="solar:full-screen-broken"
                size="18"
                class="absolute z-10 right-2 bottom-2 cursor-pointer "
                @click.stop="editVariableTextValue(variable)"
              />
            </div>
            <div v-else>
              <Input disabled class="w-full" type="text" placeholder="Receiving input" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>

    <div
      ref="footer"
      class="bg-[#27272A] rounded-b-lg py-2 pl-5 pr-10 flex items-center justify-center"
    >
      <div class="w-full h-full flex items-center justify-between">
        <NuxtIcon
          v-if="currentNode.data?.show"
          name="lets-icons:view-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.show = false"
        />
        <NuxtIcon
          v-else
          name="lets-icons:view-hide-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.show = true"
        />
        <div class="">
          Prompt Message
        </div>
      </div>
    </div>

    <Dialog v-model:open="editVariableTextValueComponent">
      <DialogContent class="dark text-white w-full max-w-7xl ">
        <DialogHeader>
          <DialogTitle>Edit text content</DialogTitle>
          <DialogDescription>
            Edit text content.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Textarea
            v-model="currentEditVariable!.value"
            class="w-full h-[60vh] resize-none"
            placeholder="Typing..."
          />
        </div>
        <DialogFooter class="w-full flex flex-row items-center justify-between">
          <Button @click="saveEditVariableTextValue">
            Finish Editing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Card>
</template>
