<script lang="ts" setup>
import UserFinanceTransaction from '~~/models/UserFinanceTransaction'
import type { ColumnDef } from '@tanstack/vue-table'
import { Checkbox } from '~/components/ui/checkbox'
import { EnumUserFinanceTransaction } from '~~/models/UserFinanceTransaction'
import DataTableColumnHeader from '~/components/me/table/columnHeader.vue'
// import DataTableRowActions from './rowAction.vue'
// import { Button } from '~/components/ui/button'

// const NuxtIcon = resolveComponent('NuxtIcon')



const props = defineProps<{
    allUserFinanceTransaction: UserFinanceTransaction[]

}>()
const emit = defineEmits(['editOne', 'deleteOne', 'detailOne', 'confirmOne'])

const dayjs = useDayjs()



const columns: ColumnDef<UserFinanceTransaction>[]
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
            accessorKey: EnumUserFinanceTransaction.WORKFLOW,
            accessorFn: ({ workflow }) => {
                return {
                    title: '工作流',
                    value: workflow?.name || '-',
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '工作流' }),
            cell: ({ row }) => h('div', { class: ' truncate' }, row.original.workflow?.name || '-------'),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: EnumUserFinanceTransaction.NOTE,
            accessorFn: ({ note }) => {
                return {
                    title: '备注',
                    value: note
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '备注', }),

            cell: ({ row }) => h('div', { class: 'max-w-96 truncate font-light ' }, row.original.note),
            enableSorting: false,
            enableHiding: false,
            filterFn: (row, columnId, filterValue) => {
                console.log('filterValue', filterValue)
                const cellValue = row.original.note || ''
                return cellValue.toLowerCase().includes(filterValue.toLowerCase())
            }
        },
        {
            accessorKey: EnumUserFinanceTransaction.CURRENCY,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '币种' }),
            cell: ({ row }) => h('div', { class: 'w-10' }, row.original.currency),
            enableSorting: false,
            enableHiding: false,

        },

        {
            accessorKey: EnumUserFinanceTransaction.USER,
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '金额' }),
            cell: ({ row }) => h('div', { class: 'w-14 ' }, (row.original.type === 'consume' ? '-' : '+') + row.original.amount.toFixed(2)),
            enableSorting: false,
            enableHiding: false,

        },


        {
            accessorKey: EnumUserFinanceTransaction.CREATEDAT,
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



const filters = ref([])

</script>

<template>

    <MeTable name="UserFinanceTransaction" class="mt-5" :data="allUserFinanceTransaction" :columns="columns" :filters="filters" filter-placeholder="搜索" filter-column="note" />

</template>
