<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'


import { DotsHorizontalIcon } from '@radix-icons/vue'

interface DataTableRowActionsProps<T> {
    row: Row<T>
}
const props = defineProps<DataTableRowActionsProps<any>>()
const emit = defineEmits(['editOne', 'deleteOne', 'detailOne'])
const { user } = storeToRefs(useUserStore())
// const toDeleteRFI = () => {
//     emit('deleteOne', props.row.original)
// }
// const toEditRFI = () => {
//     emit('editOne', props.row.original)
// }
const deleteOne = () => {
    // useToast('请确认是否删除该工作流')
    emit('deleteOne', props.row.original)
}
const isMine = computed(() => {
    return user.value && (props.row.original.user.objectId === user.value.objectId)
})


</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child @click.stop>
            <Button variant="ghost" class="flex h-8 w-8  p-0 data-[state=open]:bg-muted">
                <DotsHorizontalIcon class="h-4 w-4 " />
                <span class="sr-only">Open menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-[160px]">
            <!-- <DropdownMenuItem @click.stop="toDetailOne">
                <NuxtIcon name="fluent:apps-list-detail-20-regular" />详情
            </DropdownMenuItem>
            <DropdownMenuSeparator v-if="isMine" />
            <DropdownMenuItem v-if="isMine">
                <NuxtIcon name="cuida:edit-outline" /> 编辑
            </DropdownMenuItem> -->

            <!-- <DropdownMenuSeparator v-if="isMine" /> -->
            <DropdownMenuItem :disabled="!isMine" @click.stop="deleteOne">
                <NuxtIcon name="hugeicons:delete-03" /> 删除
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
