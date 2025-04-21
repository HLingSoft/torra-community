<script setup lang="ts">
import UserWorkflowVariable, { EnumUserWorkflowVariable } from '~/models/UserWorkflowVariable';
import User from '~/models/User';
const { user } = storeToRefs(useUserStore())
const props = defineProps<{
  modelValue: string
  disabled?: boolean
  placeholder?: string

}>()

const emit = defineEmits<{
  (e: 'save', value: any): void
}>()
const variables = ref<Record<string, any>[]>([

])
const anchorEl = ref<HTMLElement | null>(null)
const openPopover = ref(false)
const tempValue = ref(props.modelValue)
const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

watch(localValue, (val) => {
  emit('save', val)
})

watch(openPopover, (val) => {
  if (val) tempValue.value = localValue.value
})
const userVariables = ref<UserWorkflowVariable | null>(null)
onMounted(async () => {
  // 获取用户变量
  userVariables.value = await new LC.Query(UserWorkflowVariable)
    .equalTo(EnumUserWorkflowVariable.USER, user.value)
    .first() as UserWorkflowVariable
   
  if (!userVariables.value) {
    userVariables.value = new UserWorkflowVariable()
    userVariables.value.user= user.value as User
    userVariables.value.variables = {}
  }
  variables.value = Object.entries(userVariables.value.variables).map(([key, value]) => {
    return {
      name: key,
      value,
    }
  })
 
  
})





function selectVariable(variable: Record<string, any>) {
  localValue.value = variable.value
  openPopover.value = false
}
const dialogOpen = ref(false)
const currentVariable = ref({
  name: '',
  value: '',
})
const saveVariable = () => {
  if (currentVariable.value.name === '' || currentVariable.value.value === '') {
    return
  }
  if (variables.value.some(v => v.name === currentVariable.value.name)) {
   
    useToast('Variable name already exists')
    return
  }

  userVariables.value!.variables[currentVariable.value.name] = currentVariable.value.value
  userVariables.value!.save().then(() => {
    useToast('Variable saved successfully')
    variables.value.push({
      name: currentVariable.value.name,
      value: currentVariable.value.value,
    })
    currentVariable.value.name = ''
    currentVariable.value.value = ''
    dialogOpen.value = false
  }).catch((err) => {
    useToast('Failed to save variable')
  })

}

</script>

<template>
  <div v-if="!props.disabled" class="w-full relative" ref="anchorEl">

    <Input
      v-model="localValue"
      type="text"
      :placeholder="placeholder || 'Typing something...'"
      class="w-full pr-10"
    />

    <!-- 图标作为弹出 Popover 的触发按钮 -->
    <!-- <div
      class="absolute z-10 right-2 bottom-8 cursor-pointer flex items-center justify-center"
      @click="openPopover = true"
    >
      <NuxtIcon name="solar:global-line-duotone" size="18" />
    </div> -->

    <Popover class="w-full " v-model:open="openPopover" >
      <PopoverTrigger  >
        <div @click="openPopover = !openPopover">
    <NuxtIcon name="solar:global-line-duotone" size="18" />
  </div>
        <!-- <div >
          <Input v-model="localValue" type="text" :placeholder="placeholder || 'Typing something...'" class="w-full pr-10 " />
        </div>


        <div class="absolute z-10 right-2 bottom-2.5 cursor-pointer flex items-center justify-center  ">
          <NuxtIcon name="solar:global-line-duotone" size="18" />
        </div> -->
      </PopoverTrigger>

      <PopoverContent   
      side="bottom"
      align="start"
         class="p-0 dark  w-68  -mt-4 "  >
        <Command class="max-h-52">
          <CommandInput placeholder="Search Global variables..." class="text-sm placeholder:text-xs  " />
          <CommandList>
            <CommandEmpty class="text-sm text-muted-foreground font-light">No variables found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem class="!py-1.5"  v-for="variable in variables" :key="variable.name" :value="variable.value" @select="selectVariable(variable)">
                <div class="flex flex-col   pr-5 ">
                  <div class="font-medium text-xs">{{ variable.name }}</div>
                  <div class="text-xs text-muted-foreground  mt-1.5  truncate  max-w-[250px]">{{ variable.value }}</div>
                </div>
              </CommandItem>
            </CommandGroup>

          </CommandList>



        </Command>

        <div class="border-t px-1 py-1 w-full">

          <Button @click.stop="dialogOpen = true" variant="ghost" size="sm" class="w-full text-xs flex flex-row items-center gap-x-2">
            <NuxtIcon name="si:add-fill" />
            <p>Add New Variable</p>
          </Button>

        </div>
      </PopoverContent>
    </Popover>
  </div>

  <div v-else class="relative">
    <Input disabled class="w-full" type="text" :placeholder="placeholder || 'Receiving input'" />
    <NuxtIcon name="lets-icons:lock-duotone" size="20" class="absolute z-10 right-2 bottom-2.5 " />
  </div>
  <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
    <DialogContent class="dark text-white w-full text-sm ">
      <DialogHeader>
        <DialogTitle>
          <div class="flex flex-row items-center gap-x-2">
            <NuxtIcon name="solar:global-line-duotone" size="18" />Create Variable
          </div>
        </DialogTitle>
        <DialogDescription>This variable will be available for use across your flows.</DialogDescription>
      </DialogHeader>
      <Separator class="my-2" />

      <div class="flex flex-col space-y-10">
        <div class="grid w-full   items-center gap-5">
          <Label for="name">Name<span>*</span></Label>
          <Input id="name" type="text" placeholder="Enter a name for the variable..." v-model="currentVariable.name" />
        </div>
        <div class="grid w-full items-center gap-5">
          <Label for="name">Value<span>*</span></Label>
          <Input id="name" type="text" placeholder="Enter a value for the variable..." v-model="currentVariable.value" />
        </div>
      </div>
      <Separator class="my-2" />
      <DialogFooter class="w-full flex flex-row items-center justify-between">

        <Button :disabled="currentVariable.name === '' || currentVariable.value === ''" @click="saveVariable">
          Save Variable
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
