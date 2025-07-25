<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-icons/vue'

interface DataTablePaginationProps<T> {
  table: Table<T>

}

defineProps<DataTablePaginationProps<any>>()
</script>

<template>
  <div class="flex items-center justify-between px-2">
    <!-- 已选择{{ table.getFilteredSelectedRowModel().rows.length }} 行, ，{{ table.getRowCount() }} 条数据 -->
    <div class="flex-1 text-sm text-muted-foreground">
      共
      {{ table.getFilteredRowModel().rows.length }} 行
    </div>
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">
          每页显示
        </p>
        <Select :model-value="`${table.getState().pagination.pageSize}`" @update:model-value="value => table.setPageSize(Number(value))">
          <SelectTrigger class="h-8 w-20">
            <SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="pageSize in [5, 10, 20, 30, 40, 50, 100, 200, 500, 1000]" :key="pageSize" :value="`${pageSize}`">
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex w-40 items-center justify-center text-sm font-medium">
        第 {{ table.getState().pagination.pageIndex + 1 }} 页, 共
        {{ table.getPageCount() }}页
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" class="hidden h-8 w-8 p-0 lg:flex cursor-pointer" :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)">
          <span class="sr-only">第一页</span>
          <DoubleArrowLeftIcon class="h-4 w-4" />
        </Button>
        <Button variant="outline" class="h-8 w-8 p-0 cursor-pointer" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
          <span class="sr-only">上一页</span>
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button variant="outline" class="h-8 w-8 p-0 cursor-pointer" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
          <span class="sr-only">下一页</span>
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
        <Button variant="outline" class="hidden h-8 w-8 p-0 lg:flex cursor-pointer" :disabled="!table.getCanNextPage()" @click="table.setPageIndex(table.getPageCount() - 1)">
          <span class="sr-only">最后一页</span>
          <DoubleArrowRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
