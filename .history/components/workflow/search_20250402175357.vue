<script setup lang="ts">
import { Label } from '@components/shadcn/ui/label'
import {
  SidebarGroup,
  SidebarGroupContent,
//   SidebarInput,
} from '@components/shadcn/ui/sidebar'
import { Search } from 'lucide-vue-next'
</script>

<template>
  <form>
    <SidebarGroup class="py-0">
      <SidebarGroupContent class="relative">
        <Label for="search" class="sr-only">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search ..."
          class="pl-8 text-white"
        />
        <Search class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-100" />
      </SidebarGroupContent>
    </SidebarGroup>
  </form>
</template>
