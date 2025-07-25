<script setup lang="ts">
import type Workflow from '~~/models/Workflow';
import ModelUsageLog, { EnumModelUsageLog } from '~~/models/ModelUsageLog';
import DataTableColumnHeader from '~/components/me/table/columnHeader.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Checkbox } from '~/components/ui/checkbox'
import { Button } from '~/components/ui/button'

const NuxtIcon = resolveComponent('NuxtIcon')

const props = defineProps<{
    workflow: Workflow
}>();
const dayjs = useDayjs()
const { user } = storeToRefs(useUserStore());
// const isMine = computed(() => props.workflow.user.objectId === user.value?.objectId);
const allUsageLogs = ref<ModelUsageLog[]>([]);
const isFetching = ref(true);
onMounted(async () => {
    isFetching.value = true;
    await until(user).not.toBeNull();

    allUsageLogs.value = await new LC.Query(ModelUsageLog)
        .equalTo(EnumModelUsageLog.WORKFLOW, props.workflow)
        .include(EnumModelUsageLog.USER)
        // .include(EnumModelUsageLog.WORKFLOW)
        .descending(EnumModelUsageLog.CREATEDAT)


        .find() as ModelUsageLog[];

    // console.log('allUsageLogs', allUsageLogs.value);
    allUsageLogs.value = allUsageLogs.value.map(log => {
        log.workflow = props.workflow;
        return log;
    });

    isFetching.value = false;
});


const dialogOpen = ref(false)
const dialogContent = ref('')
const columns: ColumnDef<ModelUsageLog>[]
    = [
        {
            id: 'select',
            header: ({ table }) => h(Checkbox, {
                'modelValue': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
                'onUpdate:modelValue': value => table.toggleAllPageRowsSelected(!!value),
                'ariaLabel': 'Select all',
            }),
            cell: ({ row }) => h(Checkbox, {
                'modelValue': row.getIsSelected(),
                'onUpdate:modelValue': value => row.toggleSelected(!!value),
                'ariaLabel': 'Select row',
            }),
            enableSorting: false,
            enableHiding: false,
        },


        {
            accessorKey: EnumModelUsageLog.MODEL,
            accessorFn: ({ model }) => {
                return {
                    title: '模型',
                    value: model,
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Model' }),
            cell: ({ row }) => h('div', { class: 'w-10' }, row.original.model),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: EnumModelUsageLog.WORKFLOW,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Workflow' }),
            cell: ({ row }) => h('div', { class: 'w-16 truncate' }, row.original.workflow.name || '-'),

            enableSorting: false,
            enableHiding: false,

        },

        {
            accessorKey: EnumModelUsageLog.SYSTEMPROMPT,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'System Prompt' }),

            cell: ({ row }) =>
                h('div', { class: 'flex gap-2 items-center w-60 ' }, [
                    h('div', { class: 'w-52 truncate ' }, row.original.systemPrompt || '-'),
                    h('div', [
                        h(Button, {
                            variant: 'ghost',
                            size: 'sm',
                            class: 'cursor-pointer ',
                            onClick: () => {
                                dialogContent.value = row.original.systemPrompt || '-'
                                dialogOpen.value = true
                            }
                        }, {
                            default: () => [
                                h(NuxtIcon, { name: 'lets-icons:view-duotone', size: '20' }),

                            ]
                        })
                    ])
                ]),

            enableSorting: false,
            enableHiding: false,

        },

        {
            accessorKey: EnumModelUsageLog.USERPROMPT,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'User Prompt' }),


            cell: ({ row }) =>
                h('div', { class: 'flex gap-2 items-center w-60 ' }, [
                    h('div', { class: 'w-52 truncate ' }, row.original.userPrompt || '-'),
                    h('div', [
                        h(Button, {
                            variant: 'ghost',
                            size: 'sm',
                            class: 'cursor-pointer ',
                            onClick: () => {
                                dialogContent.value = row.original.userPrompt || '-'
                                dialogOpen.value = true
                            }
                        }, {
                            default: () => [
                                h(NuxtIcon, { name: 'lets-icons:view-duotone', size: '20' }),

                            ]
                        })
                    ])
                ]),

            enableSorting: false,
            enableHiding: false,

        },
        {
            accessorKey: EnumModelUsageLog.ASSISTANTMESSAGE,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Assistant Message' }),

            cell: ({ row }) =>
                h('div', { class: 'flex gap-2 items-center w-60 ' }, [
                    h('div', { class: 'w-52 truncate ' }, row.original.assistantMessage || '-'),
                    h('div', [
                        h(Button, {
                            variant: 'ghost',
                            size: 'sm',
                            class: 'cursor-pointer ',
                            onClick: () => {
                                dialogContent.value = row.original.assistantMessage || '-'
                                dialogOpen.value = true
                            }
                        }, {
                            default: () => [
                                h(NuxtIcon, { name: 'lets-icons:view-duotone', size: '20' }),

                            ]
                        })
                    ])
                ]),
            enableSorting: false,
            enableHiding: false,

        },
        {
            accessorKey: EnumModelUsageLog.PROMPTTOKENS,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Prompt Tokens' }),
            cell: ({ row }) => h('div', { class: 'w-20 truncate' }, row.original.promptTokens || 0),
            enableSorting: false,
            enableHiding: false,

        },
        {
            accessorKey: EnumModelUsageLog.COMPLETIONTOKENS,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Completion Tokens' }),
            cell: ({ row }) => h('div', { class: 'w-20 truncate' }, row.original.completionTokens || 0),
            enableSorting: false,
            enableHiding: false,

        },
        {
            accessorKey: EnumModelUsageLog.TOTALTOKENS,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Total Tokens' }),
            cell: ({ row }) => h('div', { class: 'w-20 truncate' }, row.original.totalTokens || 0),
            enableSorting: false,
            enableHiding: false,

        },
        {
            accessorKey: EnumModelUsageLog.DURATIONMS,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '耗时' }),
            cell: ({ row }) => h('div', { class: 'w-20 truncate' }, row.original.durationMs || 0),
            enableSorting: false,
            enableHiding: false,

        },
        {
            accessorKey: EnumModelUsageLog.CREATEDAT,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '创建时间' }),
            cell: ({ row }) => h('div', { class: 'w-20' }, row.original.updatedAt ? dayjs(row.original.updatedAt).format('YYYY-MM-DD HH:mm') : '-'),
            enableSorting: false,
            enableHiding: false,
            filterFn: (row, columnId, filterValues) => {
                if (!filterValues || filterValues.length === 0) return true

                const ranges = filterValues.map((value: any) => ({
                    min: dayjs(value.min, 'YYYY-MM-DD'),
                    max: dayjs(value.max, 'YYYY-MM-DD'),
                }))

                const rowDate = dayjs(row.getValue(columnId))

                if (!rowDate.isValid()) return false

                return ranges.some(({ min, max }: { min: any; max: any }) =>
                    rowDate.isBetween(min, max, 'day', '[]')
                )
            }

        },


    ]

const { copy } = useClipboard()
const copyPrompt = () => {
    copy(dialogContent.value)
    useToast('提示词复制成功')
}
</script>


<template>
    <div>
        <MeTable :data="allUsageLogs" :filters="[]" name="UsageLogs" :columns="columns"></MeTable>
        <Dialog v-model:open="dialogOpen">
            <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent class="  w-full text-sm !max-w-4xl">
                <DialogHeader>
                    <DialogTitle> Show Detail</DialogTitle>
                    <DialogDescription> </DialogDescription>
                </DialogHeader>
                <ScrollArea class="max-w-full max-h-[60vh] overflow-x-hidden">

                    <div class="text-sm max-w-full p-2 pr-10">{{ dialogContent }}</div>

                </ScrollArea>
                <DialogFooter class="w-full flex flex-row items-center justify-between">
                    <Button @click="copyPrompt">Copy</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
</template>
