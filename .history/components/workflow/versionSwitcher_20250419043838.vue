<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-vue-next'
import UserWorkspace,{ EnumUserWorkspace} from '~/models/UserWorkspace'
import User from '~/models/User'
// const props = defineProps<{
//   versions: string[]
//   defaultVersion: string
// }>()
const allWorkspaces = ref<UserWorkspace[]>([])
// const selectedVersion = ref(props.defaultVersion)
// const currentWorkspace = ref<UserWorkspace>()
const { user, currentWorkspace}= storeToRefs(useUserStore())
onMounted(async() => {
  await until(user).toBeTruthy()
  // console.log(user.value.objectId)
  // selectedVersion.value = props.defaultVersion
  allWorkspaces.value = await new LC.Query(UserWorkspace).equalTo(EnumUserWorkspace.USER,user.value).find()
  if(allWorkspaces.value.length === 0){
    const defaultWorkspace = new UserWorkspace()
    defaultWorkspace.user = user.value as User
    defaultWorkspace.name = '默认空间'
    defaultWorkspace.isDefault = true
    defaultWorkspace.description = '默认空间'
    await defaultWorkspace.save()
    allWorkspaces.value.push(defaultWorkspace)
    
  }
  else{
    allWorkspaces.value.forEach((workspace) => {
      if(workspace.isDefault){
        currentWorkspace.value = workspace
      }
    })
  }
  currentWorkspace.value=allWorkspaces.value.find((workspace => workspace.isDefault)) || allWorkspaces.value[0]
  console.log('allWorkspaces.value', allWorkspaces.value)
})
watch(currentWorkspace,async (newWorkspace,oldWorkspace) => {
  //objectId 不同的时候保存一下
  if(newWorkspace &&oldWorkspace &&  newWorkspace.objectId !== oldWorkspace.objectId){
    await newWorkspace.save()
  }
})
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div class="flex bg-white aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <img src="~/assets/logo.png" class="w-auto max-h-10">
              <!-- <GalleryVerticalEnd class="size-4" /> -->
            </div>
            <div class="flex flex-col gap-0.5 leading-none">
              <!-- <span class="font-semibold">默认空间</span> -->
              <span class="text-sm">{{ currentWorkspace?.name }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-60 dark"
          align="start"
        >
          <DropdownMenuItem
            v-for="workspace in allWorkspaces"
            :key="workspace.objectId"
            class="w-full text-xs"
            @select="currentWorkspace = workspace"
          >
            {{ workspace.name }}
            <Check v-if="workspace.objectId === currentWorkspace?.objectId" class="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
