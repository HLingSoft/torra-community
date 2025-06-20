<script setup lang="ts">
import UserWorkflowVariable, { EnumUserWorkflowVariable } from '~/models/UserWorkflowVariable'
import User from '~/models/User'
import type { InputPortVariable } from '~/types/workflow'
import { Handle, Position } from '@vue-flow/core'
const { edges } = storeToRefs(useWorkflowStore())

defineProps<{ placeholder?: string }>()
const { user } = storeToRefs(useUserStore())
const inputVariableRef = defineModel<InputPortVariable>('inputVariable')

const openDialog = ref(false)
const popoverOpen = ref(false)
const popoverWidth = ref('auto')
const inputRef = ref<HTMLElement | null>(null)

const variables = ref<Record<string, any>[]>([])
const tempValue = ref(inputVariableRef.value?.value || '')

watch(popoverOpen, (val) => {
  if (val) tempValue.value = inputVariableRef.value?.value || ''
})

const userVariables = ref<UserWorkflowVariable | null>(null)
const targetHandleUUID = ref()
onMounted(async () => {
  if (inputVariableRef.value) {
    if (!inputVariableRef.value.id) {
      inputVariableRef.value.id = nanoLowercaseAlphanumericId(10)
    }
    targetHandleUUID.value = inputVariableRef.value.id
  }
  // 获取用户变量
  userVariables.value = await new LC.Query(UserWorkflowVariable)
    .equalTo(EnumUserWorkflowVariable.USER, user.value)
    .first() as UserWorkflowVariable

  if (!userVariables.value) {
    userVariables.value = new UserWorkflowVariable()
    userVariables.value.user = user.value as User
    userVariables.value.variables = {}
  }

  variables.value = Object.entries(userVariables.value.variables).map(([key, value]) => ({
    name: key,
    value,
  }))

  nextTick(() => {
    if (inputRef.value) {
      popoverWidth.value = `${inputRef.value.offsetWidth - 12}px`
    }
  })

})

function selectVariable(variable: Record<string, any>) {
  if (inputVariableRef.value) {
    inputVariableRef.value.value = variable.value
    popoverOpen.value = false
  }
}

// 添加变量
const currentVariable = ref({ name: '', value: '' })

function saveVariable() {
  if (!currentVariable.value.name || !currentVariable.value.value) return

  if (variables.value.some(v => v.name === currentVariable.value.name)) {
    useToast('Variable name already exists')
    return
  }

  userVariables.value!.variables[currentVariable.value.name] = currentVariable.value.value
  userVariables.value!.save().then(() => {
    useToast('Variable saved successfully')
    variables.value.push({ ...currentVariable.value })
    currentVariable.value.name = ''
    currentVariable.value.value = ''
    openDialog.value = false
  }).catch(() => {
    useToast('Failed to save variable')
  })
}

watch(edges, () => {
  if (inputVariableRef.value && targetHandleUUID.value) {

    //看看是否有连接
    inputVariableRef.value.connected = edges.value.some(edge => edge.targetHandle === targetHandleUUID.value)
  }
}, { immediate: true })

onUnmounted(() => {
  console.log('Unmounting global variable popover')
  if (inputVariableRef.value && targetHandleUUID.value) {
    const index = edges.value.findIndex(edge => edge.targetHandle === targetHandleUUID.value)
    if (index !== -1) {
      edges.value.splice(index, 1)
    }
  }
})


</script>

<template>
  <div ref="inputRef" class="relative w-full" v-if="inputVariableRef">
    <Handle type="target" :id="targetHandleUUID" :connectable-start="false" :position="Position.Left" :style="{ top: '20px', left: '-25px' }" />
    <div v-if="!inputVariableRef.connected" class="h-10">
      <div class="relative  ">
        <Input v-model="inputVariableRef.value" type="text" class="w-full pr-10" :placeholder="placeholder || `Typing something...`" />

        <NuxtIcon name="solar:global-line-duotone" size="18" class="absolute z-10 right-2 bottom-2.5 cursor-pointer" @click.stop="popoverOpen = true" />
      </div>
      <Popover v-model:open="popoverOpen">
        <PopoverTrigger />
        <PopoverContent side="bottom" align="start" :style="{ width: popoverWidth }" class="w-full dark !p-0 -mt-4" teleport="false">
          <Command class="max-h-52">
            <CommandInput placeholder="Search Global variables..." class="text-sm placeholder:text-xs" />
            <CommandList>
              <CommandEmpty class="text-sm text-muted-foreground font-light">No variables found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem v-for="variable in variables" :key="variable.name" :value="variable.value" class="!py-1.5" @select="selectVariable(variable)">
                  <div class="flex flex-col pr-5">
                    <div class="font-medium text-xs">{{ variable.name }}</div>
                    <div class="text-xs text-muted-foreground mt-1.5 truncate max-w-[250px]">{{ variable.value }}</div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <div class="border-t px-1 py-1 w-full">
            <Button @click.stop="openDialog = true" variant="ghost" size="sm" class="w-full text-xs flex items-center gap-x-2">
              <NuxtIcon name="si:add-fill" />
              <p>Add New Variable</p>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>

    <div v-else class="relative h-10">
      <Input disabled class="w-full" placeholder="Receiving input" />
      <NuxtIcon name="lets-icons:lock-duotone" size="20" class="absolute z-10 right-2 bottom-2.5" />
    </div>

    <Dialog :open="openDialog" @update:open="openDialog = $event">
      <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="dark text-white w-full text-sm">
        <DialogHeader>
          <DialogTitle>
            <NuxtIcon name="solar:global-line-duotone" size="18" /> Create Variable
          </DialogTitle>
          <DialogDescription>This variable will be available across flows.</DialogDescription>
        </DialogHeader>
        <Separator class="my-2" />
        <div class="flex flex-col space-y-10">
          <div class="grid w-full items-center gap-5">
            <Label>Name<span>*</span></Label>
            <Input v-model="currentVariable.name" placeholder="Enter variable name..." />
          </div>
          <div class="grid w-full items-center gap-5">
            <Label>Value<span>*</span></Label>
            <Input v-model="currentVariable.value" placeholder="Enter variable value..." />
          </div>
        </div>
        <Separator class="my-2" />
        <DialogFooter class="w-full flex justify-between">
          <Button :disabled="!currentVariable.name || !currentVariable.value" @click="saveVariable">Save Variable</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


  </div>
</template>
