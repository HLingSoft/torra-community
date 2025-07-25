<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ users: { id: string; name: string; avatar: string }[] }>()

const displayUsers = computed(() => props.users.slice(0, 3))
const extraCount = computed(() => props.users.length - displayUsers.value.length)
</script>

<template>
    <div class="flex items-center -space-x-2">
        <template v-for="user in displayUsers">
            <Avatar class="ring ring-white">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback>{{ user.name.slice(0, 2) }}</AvatarFallback>
            </Avatar>
        </template>
        <div v-if="extraCount > 0" class="w-8 h-8 rounded-full bg-gray-200 text-sm text-gray-700 flex items-center justify-center ring ring-white">
            +{{ extraCount }}
        </div>
    </div>
</template>
