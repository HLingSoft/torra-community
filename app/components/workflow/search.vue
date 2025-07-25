<script setup lang="ts">
import { Label } from '~/components/ui/label'
import {
  SidebarGroup,
  SidebarGroupContent,
} from '~/components/ui/sidebar'
import { Search } from 'lucide-vue-next'
const searchKeyword = defineModel<string>()
</script>

<template>
  <form>
    <SidebarGroup class="py-0">
      <SidebarGroupContent class="relative">
        <Label for="search" class="sr-only">
          Search
        </Label>
        <Input id="search" v-model="searchKeyword" placeholder="Search ..." class="pl-8  " />
        <Search class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-100" />
      </SidebarGroupContent>
    </SidebarGroup>
  </form>
</template>
