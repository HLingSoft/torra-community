<script setup lang="ts">
import type { Column, Table } from '@tanstack/vue-table'

import { MixerHorizontalIcon } from '@radix-icons/vue'

interface DataTableViewOptionsProps<T> {
  table: Table<T>
}

const props = defineProps<DataTableViewOptionsProps<any>>()

const columns = computed(() => props.table.getAllColumns()
  .filter(
    column =>
      typeof column.accessorFn !== 'undefined' && column.getCanHide(),
  ))

const getColumnTitle = (column: Column<any, any>): string => {
  const header = column.columnDef.header
  if (typeof header === 'string') {
    return header // 如果 header 是字符串，直接使用
  }
  else if (typeof header === 'function') {
    try {
      // @ts-ignore
      const renderResult = header(column) // 调用函数，模拟渲染，传入 `column` 上下文
      if (renderResult && renderResult.props && renderResult.props.title) {
        return renderResult.props.title // 获取标题
      }
    }
    catch (e) {
      console.warn('Failed to parse header title from header function', e)
    }
  }
  return column.id // 如果其他方法都没有找到合适的标题，返回 id 作为备用
}
</script>

<template>
  <DropdownMenu v-if="columns.length > 0">
    <DropdownMenuTrigger as-child @click.stop>
      <Button variant="outline" size="sm" class="ml-auto hidden h-8 lg:flex">
        <MixerHorizontalIcon class="mr-2 h-4 w-4" />
        筛选列
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[150px]">
      <DropdownMenuLabel>切换</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuCheckboxItem v-for="column in columns" :key="column.id" class="capitalize" :checked="column.getIsVisible()" @select="(e) => e.preventDefault()" @update:checked="(value) => column.toggleVisibility(!!value)">
        {{ getColumnTitle(column) }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
