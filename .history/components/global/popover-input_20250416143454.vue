<script setup lang="ts">
import   UserWorkflowVariable, {  EnumUserWorkflowVariable }  from '~/models/UserWorkflowVariable';
 

const { user}=storeToRefs(useUserStore())
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





function selectVariable(variable:Record<string, any>) {
  localValue.value = variable.value
  openPopover.value = false
}

</script>

<template>
  <div v-if="!props.disabled" class=" w-full">


    <Popover class="w-full" v-model:open="openPopover">
      <PopoverTrigger class="w-full relative">
        <div  >
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
       
          <!-- <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="profile">
              <div class="flex flex-row items-center gap-x-2">
                <NuxtIcon name="si:add-fill" />
                <p>Add New Variable</p>
              </div>

            </CommandItem>

          </CommandGroup> -->

        </Command>
       <!-- 移到 Command 外部，始终可见 -->
<div class="border-t px-3 py-2">
   
    <Button   class="flex flex-row items-center gap-x-2">
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
</template>
