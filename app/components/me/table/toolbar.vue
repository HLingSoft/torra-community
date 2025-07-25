<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { Cross2Icon } from '@radix-icons/vue'
import dayjs from 'dayjs'

import * as XLSX from 'xlsx'
import DataTableFacetedFilter from './facetedFilter.vue'
import DataTableViewOptions from './viewOptions.vue'

const props = defineProps<DataTableToolbarProps<any>>()
const emit = defineEmits<{
  (e: 'update:data', val: any[]): void
}>()
// const { currentProject, user } = storeToRefs(useUserStore())
interface DataTableToolbarProps<T> {
  table: Table<T>
  filters: any[]
  filterPlaceholder?: string
  filterColumn?: string
  name: string
  data: T[] // ✅ 加上这一行！
  showDelete?: boolean
  // pdfButton?: boolean

}

// 获取所有数据
// const allRows = computed(() => props.table.getRowModel().rows.map(row => row.original))

const allRows = computed(() => props.table.getFilteredRowModel().rows.map(row => row.original))

const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)
const isExporting = ref(false)
const exportToExcel = async () => {
  if (isExporting.value) {
    return
  }

  if (allRows.value.length === 0) {
    useToast('没有数据可导出')
    return
  }
  isExporting.value = true
  const allData: Record<string, any>[] = [] // 存储所有行的数据
  const columns = props.table.getAllColumns() // 获取所有列

  allRows.value.forEach((item, index) => {
    // console.log('rowData', rowData)
    const rowData: Record<string, any> = {}
    columns.forEach((column) => {
      const accessorFn = column.accessorFn // 获取列的 accessorFn

      if (accessorFn && typeof accessorFn === 'function') {
        const { title, value } = accessorFn(item, index) as { title: string, value: any }
        console.log('value', value)
        if (value instanceof Date) {
          rowData[title] = XLSX.utils.format_cell({ t: 'd', v: value }) // 将日期转换为 Excel 日期格式
        }
        else {
          rowData[title] = value
        }
      }
    })
    // console.log('rowData', rowData)
    allData.push(rowData) // 将每一行的数据添加到数组中
  })
  // 过滤掉allData数组里面的null和undefined。把 key 的值为 null 或 undefined 的删掉

  allData.forEach((item) => {
    for (const key in item) {
      if (item[key] === null || item[key] === undefined) {
        delete item[key]
      }
    }
  })
  // console.log('allData', allData)
  const ws = XLSX.utils.json_to_sheet(allData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, props.name)
  // const fileName = currentProject.value?.name || user.value?.realName || user.value?.nickname || '项目家'
  XLSX.writeFile(wb, `${props.name}_${dayjs().format('YYYY-MM-DD HH:mm')}.xlsx`)
  isExporting.value = false
}

const deleteAll = () => {
  // useConfirm({
  //   title: '删除数据',
  //   content: `确定要删除${allRows.value.length} 条数据吗？`,
  //   showCancel: true,
  //   cancelText: '取消',
  //   confirmText: '确定',
  //   confirm: async () => {
  //     console.log('deleteAll', allRows.value)
  //     // props.table.resetColumnFilters()
  //     const ids = allRows.value.map(item => item.objectId)
  //     await LC.Object.destroyAll(allRows.value)
  //     const newData = props.data.filter(item => !ids.includes(item.objectId))
  //     emit('update:data', newData) // ✅ 通知外层更新 data
  //     useHLToast('删除成功', ToastPosition.TOP_CENTER)
  //   },
  // })
}


</script>

<template>
  <div class="flex items-center justify-between ">
    <div class="flex flex-1 items-center space-x-2">
      <Input v-if="filterColumn" :placeholder="filterPlaceholder" :model-value="(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''" class="h-8 w-[150px] lg:w-[250px]" @input="table.getColumn(filterColumn)?.setFilterValue($event.target.value)" />
      <DataTableFacetedFilter v-for="filter in filters" :key="filter.id" :title="filter.title" :column="table.getColumn(filter.id)" :options="filter.options" />



      <Button v-if="isFiltered" variant="ghost" class="h-8 px-2 lg:px-3 text-xs" @click="table.resetColumnFilters()">
        重置
        <Cross2Icon class="ml-2 h-4 w-4" />
      </Button>
    </div>
    <div class="flex flex-row items-center space-x-4">
      <!-- <Button v-if="showDelete && user?.objectId === currentProject?.user.objectId" variant="destructive" size="sm" :disabled="allRows.length === 0" class="ml-auto hidden h-8 lg:flex" @click="deleteAll">
        <NuxtIcon name="fluent:delete-28-regular" class="mr-2 h-4 w-4" />
        全部删除
      </Button> -->
      <Button variant="outline" size="sm" :disabled="isExporting" class="ml-auto hidden h-8 lg:flex" @click="exportToExcel">
        <NuxtIcon name="solar:export-line-duotone" class="mr-2 h-4 w-4" />
        导出为Excel
      </Button>
      <DataTableViewOptions :table="table" />
    </div>
  </div>
</template>
