<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  Updater,
  VisibilityState,
} from '@tanstack/vue-table'

import {
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useVueTable,
} from '@tanstack/vue-table'

import DataTablePagination from './pagination.vue'
import DataTableToolbar from './toolbar.vue'

const props = defineProps<DataTableProps<any>>()
const emit = defineEmits<{
  (event: 'updateFilteredRows', rows: any[]): void
  (event: 'click', row: any): void // 新增 click 事件
  (event: 'update:data', data: any[]): void
}>()

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[]
  data: T[]
  filters: any[]
  filterPlaceholder?: string
  filterColumn?: string
  name: string

  pageSize?: number



}
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

// const sorting = ref<SortingState>([])
// const columnFilters = ref<ColumnFiltersState>([])
// const columnVisibility = ref<VisibilityState>({})
// const rowSelection = ref({})
const expanded = ref<ExpandedState>({})

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
    get expanded() { return expanded.value },
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  enableRowSelection: true,

  initialState: {
    pagination: {
      pageSize: props.pageSize ?? 10,
    },
  },

  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
})


function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

const filteredRows = computed(() => {
  return table.getFilteredRowModel().rows.map(row => row.original)
})
// 监听 filteredRows 的变化
watch(
  filteredRows,
  (newFilteredRows) => {
    emit('updateFilteredRows', newFilteredRows)
  },
  { immediate: true },
)



onMounted(() => {
  // console.log('props.data', props.data)
})
</script>

<template>
  <div class="space-y-4">
    <DataTableToolbar :data="data" :name="name" :table="table" :filters="filters" :filter-placeholder="filterPlaceholder" :filter-column="filterColumn" @update:data="val => emit('update:data', val)" />

    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <TableRow :data-state="row.getIsSelected() && 'selected'" @click="() => emit('click', row.original)">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
            <TableRow v-if="row.getIsExpanded()">
              <TableCell :colspan="row.getAllCells().length">
                {{ JSON.stringify(row.original) }}
              </TableCell>
            </TableRow>
          </template>
        </template>
        <TableRow v-else>
          <TableCell :colspan="columns.length" class="h-24 text-center">
            没有数据
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>



    <DataTablePagination :table="table" />
  </div>
</template>

<style scoped>
/* 可以在同一个 .vue 文件里的 <style> 中写（注意 scoped 可能需要额外处理） */
.sticky-col {
  position: sticky;
  right: 0;
  background: #fff; /* 避免滚动时透明 */
  z-index: 10;
  min-width: 100px; /* 视情况而定，防止列过窄 */
  /* 可选：分隔阴影，让它跟左侧列有视觉分割 */

}
</style>
