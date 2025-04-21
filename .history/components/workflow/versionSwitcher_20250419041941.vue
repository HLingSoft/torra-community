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

// const props = defineProps<{
//   versions: string[]
//   defaultVersion: string
// }>()
const allWorkspaces = ref<UserWorkspace[]>([])
// const selectedVersion = ref(props.defaultVersion)
const currentWorkspace = ref<UserWorkspace>()
const { user}= storeToRefs(useUserStore())
onMounted(async() => {
  await until(user).toBeTruthy()
  // selectedVersion.value = props.defaultVersion
  allWorkspaces.value = await new LC.Query(UserWorkspace).equalTo(EnumUserWorkspace.USER,user.value).find()
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
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <img src="~/assets/logo.png" class="w-auto max-h-12">
              <!-- <GalleryVerticalEnd class="size-4" /> -->
            </div>
            <div class="flex flex-col gap-0.5 leading-none">
              <span class="font-semibold">默认空间</span>
              <span class="">{{ currentWorkspace?.name }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width]"
          align="start"
        >
          <DropdownMenuItem
            v-for="version in versions"
            :key="version"
            @select="selectedVersion = version"
          >
            v{{ version }}
            <Check v-if="version === selectedVersion" class="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
