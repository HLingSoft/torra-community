<script lang="ts" setup>
import Workflow from '~~/models/Workflow'
import type { ColumnDef } from '@tanstack/vue-table'
import { Checkbox } from '~/components/ui/checkbox'
import { EnumWorkflow } from '~~/models/Workflow'
import DataTableColumnHeader from '~/components/me/table/columnHeader.vue'
import DataTableRowActions from './rowAction.vue'
import { Button } from '~/components/ui/button'

const NuxtIcon = resolveComponent('NuxtIcon')



const props = defineProps<{
    allWorkflow: Workflow[]

}>()
const emit = defineEmits(['editOne', 'deleteOne', 'detailOne', 'confirmOne'])

const dayjs = useDayjs()

const { copy } = useClipboard()
const copyToken = (token: string) => {
    copy(token)

    useToast('Token 已复制到剪贴板')
}

const columns: ColumnDef<Workflow>[]
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
            accessorKey: EnumWorkflow.NAME,
            accessorFn: ({ name }) => {
                return {
                    title: '名称',
                    value: name,
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '名称' }),
            cell: ({ row }) => h('div', { class: 'truncate  font-extrabold max-w-40 2xl:max-w-60' }, row.original.name),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: EnumWorkflow.DESCRIPTION,
            accessorFn: ({ description }) => {
                return {
                    title: '描述',
                    value: description,
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '描述' }),
            cell: ({ row }) => h('div', { class: 'truncate  max-w-20 2xl:max-w-60' }, row.original.description),
            enableSorting: false,
            enableHiding: false,

        },
        {
            accessorKey: EnumWorkflow.TOKEN,
            accessorFn: ({ token }) => {
                return {
                    title: 'API Token',
                    value: token,
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Token' }),
            cell: ({ row }) =>
                h('div', { class: 'flex gap-2 items-center' }, [
                    h('div', { class: 'max-w-20 2xl:max-w-32 truncate' }, row.original.token),
                    row.original.token &&
                    h('div', [
                        h(Button, {
                            variant: 'ghost',
                            size: 'sm',
                            class: 'cursor-pointer',
                            onClick: () => copyToken(row.original.token)
                        }, {
                            default: () => [
                                h(NuxtIcon, { name: 'basil:copy-outline', size: '20' }),
                            ]
                        })
                    ])
                ]),
            enableSorting: false,
            enableHiding: false,
            filterFn: (row, id, value) => {
                return value.includes(row.original.token && row.original.token.length > 0)
            },
        },

        {
            accessorKey: EnumWorkflow.USER,
            accessorFn: ({ user }) => {
                return {
                    title: '创建人',
                    value: user.name,
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '创建人' }),
            cell: ({ row }) => h('div', { class: ' font-light' }, row.original.user.name),
            enableSorting: false,
            enableHiding: false,
            filterFn: (row, id, value) => {

                return value.includes(row.original.user.objectId)
            },
        },

        {
            accessorKey: EnumWorkflow.UPDATEDAT,
            accessorFn: ({ updatedAt }) => {
                return {
                    title: '更新时间',
                    value: dayjs(updatedAt).format('YYYY-MM-DD HH:mm'),
                }
            },
            header: ({ column }) => h(DataTableColumnHeader, { column, title: '更新时间' }),
            cell: ({ row }) => h('div', { class: 'w-20' }, row.original.updatedAt ? dayjs(row.original.updatedAt).format('YYYY-MM-DD HH:mm') : '-'),
            enableSorting: false,
            enableHiding: false,
            filterFn: (row, columnId, filterValues) => {
                // 如果用户没有选择任何选项，直接返回 true（不过滤）
                if (!filterValues || filterValues.length === 0) {
                    return true
                }

                // 解析所有用户选择的日期范围
                const ranges = filterValues.map((value: any) => ({
                    min: dayjs(value.min, 'YYYY-MM-DD'),
                    max: dayjs(value.max, 'YYYY-MM-DD'),
                }))

                // 获取当前行的创建日期（转成 dayjs 对象）
                const rowDate = dayjs((row.getValue(columnId) as any).value)

                // 如果行的日期无效，直接返回 false
                if (!rowDate.isValid()) {
                    return false
                }

                // 检查行的日期是否在任意一个范围内
                return ranges.some(({ min, max }: { min: any; max: any }) =>
                    rowDate.isBetween(min, max, 'day', '[]')
                )
            },
        },
        {
            accessorKey: EnumWorkflow.CREATEDAT,
            accessorFn: ({ createdAt }) => {
                return {
                    title: '创建时间',
                    value: dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
                }
            },
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


        {
            id: 'actions',

            header: ({ column }) => h(DataTableColumnHeader, { column, title: '操作' }),
            cell: ({ row }) => h(DataTableRowActions, {
                row,
                // onEditOne: () => toEditRFI(row.original),
                onDeleteOne: () => toDelete(row.original),
                // onDetailOne: () => toDetailRFI(row.original),
                // onConfirmOne: () => toConfirmRFI(row.original),
            }),
            enableSorting: false,
            enableHiding: false,
        },
    ]


const filters = ref([
    {
        id: EnumWorkflow.USER, // 列的 accessorKey
        title: '创建人',
        options: [

        ],
    },

    {
        id: EnumWorkflow.TOKEN, // 列的 accessorKey
        title: 'API',
        options: [
            {
                label: '是',
                value: true,
            },
            {
                label: '否',
                value: false,
            },

        ],
    },
    {
        id: EnumWorkflow.UPDATEDAT, // 列的 accessorKey
        title: '更新日期',
        options: [

            {
                label: '本周内',
                value: {
                    min: dayjs().startOf('week').format('YYYY-MM-DD'), // 本周第一天的起始时间
                    max: dayjs().endOf('day').format('YYYY-MM-DD'), // 今天的最后一秒
                },
            },
            {
                label: '本月内',
                value: {
                    min: dayjs().startOf('month').format('YYYY-MM-DD'), // 本月第一天的起始时间
                    max: dayjs().endOf('day').format('YYYY-MM-DD'), // 今天的最后一秒
                },
            },
            {
                label: '本季度内',
                value: {
                    min: dayjs().startOf('quarter').format('YYYY-MM-DD'), // 本季度第一天的起始时间
                    max: dayjs().endOf('day').format('YYYY-MM-DD'), // 今天的最后一秒
                },
            },
        ],
    },
    {
        id: EnumWorkflow.CREATEDAT, // 列的 accessorKey
        title: '创建日期',
        options: [

            {
                label: '本周内',
                value: {
                    min: dayjs().startOf('week').format('YYYY-MM-DD'), // 本周第一天的起始时间
                    max: dayjs().endOf('day').format('YYYY-MM-DD'), // 今天的最后一秒
                },
            },
            {
                label: '本月内',
                value: {
                    min: dayjs().startOf('month').format('YYYY-MM-DD'), // 本月第一天的起始时间
                    max: dayjs().endOf('day').format('YYYY-MM-DD'), // 今天的最后一秒
                },
            },
            {
                label: '本季度内',
                value: {
                    min: dayjs().startOf('quarter').format('YYYY-MM-DD'), // 本季度第一天的起始时间
                    max: dayjs().endOf('day').format('YYYY-MM-DD'), // 今天的最后一秒
                },
            },
        ],
    },
])

/**
 * 更新 filters 中指定 id 的 options
 * @param { string} id - filters 中的唯一标识符
 * @param { Array} options - 要设置的新 options 数组
 */
const updateFilterOptions = (id: string, options: any) => {
    filters.value = filters.value.map(f => {
        if (f.id === id) {
            return { ...f, options }
        }
        return f
    })
    return filters.value
}


const handleRowClick = (row: Workflow) => {
    console.log('handleRowClick row', row)
    emit('detailOne', row)
}

const toDelete = async (row: Workflow) => {
    emit('deleteOne', row)
}
watch(() => props.allWorkflow, async () => {

    //找到所有的人  
    const uniqueUsers = new Map()

    props.allWorkflow.forEach(workflow => {
        const user = workflow.user
        if (user && !uniqueUsers.has(user.objectId)) {
            uniqueUsers.set(user.objectId, {
                label: user.name,
                value: user.objectId
            })
        }
    })
    // 将 Map 转换为数组
    const uniqueUsersArray = Array.from(uniqueUsers.values())

    filters.value = updateFilterOptions(EnumWorkflow.USER, uniqueUsersArray)

}, {
    immediate: true,
    deep: true,
})
</script>

<template>

    <MeTable name="Workflow" class="mt-5  " :data="allWorkflow" :columns="columns" :filters="filters" filter-placeholder="搜索" filter-column="name" />

</template>
