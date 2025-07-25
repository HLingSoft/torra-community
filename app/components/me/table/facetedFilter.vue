<!-- components/table/DataTableFacetedFilter.vue -->
<script setup lang="ts">
import type { Column } from '@tanstack/vue-table'
import type { Component } from 'vue'
import { cn } from '@/lib/utils'

import { CheckIcon, PlusCircledIcon } from '@radix-icons/vue'

interface Option extends Record<string, any> {
  label: string
  value: string
  icon?: Component
}

interface DataTableFacetedFilterProps<T> {
  column?: Column<T, any>
  title?: string
  options: Option[]
}

const props = defineProps<DataTableFacetedFilterProps<any>>()
const { column, title, options } = props

const facets = computed(() => column?.getFacetedUniqueValues())
const selectedValues = computed(() => new Set(column?.getFilterValue() as string[]))
const localOptions = ref<Option[]>([...props.options])

watch(() => props.options, (newVal) => {
  localOptions.value = [...newVal]
  // console.log('options updated:', localOptions.value)
}, { immediate: true, deep: true })
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 border-dashed">
        <PlusCircledIcon class="mr-2 h-4 w-4" />
        {{ title }}
        <template v-if="selectedValues.size > 0">
          <Separator orientation="vertical" class="mx-2 h-4" />
          <Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
            {{ selectedValues.size }}
          </Badge>
          <div class="hidden space-x-1 lg:flex">
            <Badge v-if="selectedValues.size > 2" variant="secondary" class="rounded-sm px-1 font-normal">
              {{ selectedValues.size }}
            </Badge>
            <template v-else>
              <Badge v-for="option in localOptions.filter((option) => selectedValues.has(option.value))" :key="option.value" variant="secondary" class="rounded-sm px-1 font-normal">
                {{ option.label }}
              </Badge>
            </template>
          </div>
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Command :filter-function="(list: (string | number | false | true | Record<string, any>)[], term: string) => {
        const options = list.filter((i): i is Option => {
          return typeof i === 'object' && i !== null && 'label' in i && typeof i.label === 'string'
        })
        return options.filter(i => i.label.toLowerCase().includes(term.toLowerCase()))
      }">
        <CommandInput :placeholder="title" class="placeholder:text-xs" />
        <CommandList>
          <CommandEmpty>暂未找到</CommandEmpty>
          <CommandGroup>
            <CommandItem v-for="option in localOptions" :key="option.value" :value="option" @select="() => {
              const isSelected = selectedValues.has(option.value)
              if (isSelected) {
                selectedValues.delete(option.value)
              }
              else {
                selectedValues.add(option.value)
              }
              const filterValues = Array.from(selectedValues)
              column?.setFilterValue(filterValues.length ? filterValues : undefined)
            }">
              <div :class="cn(
                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                selectedValues.has(option.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'opacity-50 [&_svg]:invisible',
              )">
                <NuxtIcon name="radix-icons:check" v-if="selectedValues.has(option.value)" class="h-4 w-4 text-primary-foreground" />
                <!-- <CheckIcon class="h-4 w-4 " /> -->
              </div>
              <component :is="option.icon" v-if="option.icon" class="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{{ option.label }}</span>
              <span v-if="facets?.get(option.value)" class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                {{ facets.get(option.value) }}
              </span>
            </CommandItem>
          </CommandGroup>

          <template v-if="selectedValues.size > 0">
            <CommandSeparator />
            <CommandGroup>
              <CommandItem :value="{ label: 'Clear filters' }" class="justify-center text-center" @select="column?.setFilterValue(undefined)">
                清空筛选
              </CommandItem>
            </CommandGroup>
          </template>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
