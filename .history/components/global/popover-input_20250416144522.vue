<script setup lang="ts">
import UserWorkflowVariable, { EnumUserWorkflowVariable } from '~/models/UserWorkflowVariable';

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

onMounted(async () => {
  // 获取用户变量
  const userVariables = await new LC.Query(UserWorkflowVariable)
    .equalTo(EnumUserWorkflowVariable.USER, user.value)
    .first() as UserWorkflowVariable
  if (!userVariables) return
  variables.value = userVariables.variables.map((item) => {
    return {
      name: item.name,
      value: item.value,
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
</script>

<template>
  <div v-if="!props.disabled" class=" w-full">


    <Popover class="w-full" v-model:open="openPopover">
      <PopoverTrigger class="w-full relative">
        <div>
          <Input v-model="localValue" type="text" :placeholder="placeholder || 'Typing something...'" class="w-full pr-10 " />
        </div>


        <div class="absolute z-10 right-2 bottom-2.5 cursor-pointer flex items-center justify-center  ">
          <NuxtIcon name="solar:global-line-duotone" size="18" />
        </div>
      </PopoverTrigger>

      <PopoverContent class="p-0 dark  ">
        <Command>
          <CommandInput placeholder="Search Global variables..." class="text-sm placeholder:text-xs" />
          <CommandList>
            <CommandEmpty>No variables found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem v-for="variable in variables" :key="variable.name" :value="variable.value" @select="selectVariable(variable)">
                <div class="flex flex-col">
                  <span class="font-medium text-xs">{{ variable.name }}</span>
                  <span class="text-xs text-muted-foreground truncate">{{ variable.value }}</span>
                </div>
              </CommandItem>
            </CommandGroup>

          </CommandList>

       

        </Command>
       
        <div class="border-t px-3 py-2 w-full">

          <Button @click.stop="dialogOpen=true" variant="ghost" size="sm" class="w-full flex flex-row items-center gap-x-2">
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
    <DialogContent class="dark text-white w-full text-sm !max-w-4xl ">
      <DialogHeader>
        <DialogTitle><div class="flex flex-row items-center gap-x-2"> <NuxtIcon name="solar:global-line-duotone" size="18" />Create Variable</div></DialogTitle>
        <DialogDescription>This variable will be available for use across your flows.</DialogDescription>
      </DialogHeader>

       <div>
        <div class="grid w-full max-w-sm items-center gap-1.5">
          <Label for="name">Name</Label>
          <Input id="name" type="text" placeholder="" v-model="currentVariable.name" />
        </div>
        <div class="grid w-full max-w-sm items-center gap-1.5">
          <Label for="name">Name</Label>
          <Input id="name" type="text" placeholder="" v-model="currentVariable.name" />
        </div>
       </div>

      <DialogFooter class="w-full flex flex-row items-center justify-between">
        
        <Button  >
          Save Variable
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
