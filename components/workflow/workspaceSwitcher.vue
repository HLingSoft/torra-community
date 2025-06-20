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
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import UserWorkspace, { EnumUserWorkspace } from '~/models/UserWorkspace'


const allWorkspaces = ref<UserWorkspace[]>([])

const { user, currentWorkspace } = storeToRefs(useUserStore())
onMounted(async () => {
  await until(user).toBeTruthy()

  allWorkspaces.value = await new LC.Query(UserWorkspace).equalTo(EnumUserWorkspace.USER, user.value).find()

})

</script>

<template>
  <SidebarMenu class="">
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <div class="flex bg-white aspect-square size-7 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <img src="~/assets/logo.png" class="w-auto max-h-10">

            </div>
            <div class="flex flex-col gap-0.5 leading-none">

              <span class="text-xs">{{ currentWorkspace?.name }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-60 dark py-2" align="start">
          <DropdownMenuItem v-for="workspace in allWorkspaces" :key="workspace.objectId" class="w-full text-xs py-2" @select="currentWorkspace = workspace">
            {{ workspace.name }}
            <Check v-if="workspace.objectId === currentWorkspace?.objectId" class="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
