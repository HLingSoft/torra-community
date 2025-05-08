<script setup lang="ts">
interface KeyValueRow {
  id: number
  name: string
  description: string
  type: string
  selected: boolean
  items?: KeyValueRow[]  // <--- 重点：子元素，只有 type === 'array' 时才有
}

type KeyValueTable = KeyValueRow[]
type KeyValueObject = Record<string, { name: string, description: string; type: string }>

const props = defineProps<{
  modelValue: KeyValueObject
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: KeyValueObject): void
}>()

let idCounter = 0

const createRow = (isSubRow = false): KeyValueRow => ({
  id: ++idCounter,
  name: '',
  description: '',
  type: 'string',
  selected: false,
  ...(isSubRow ? {} : { items: [] }) // 只有主行可以有 items
})

const objectToRows = (obj: KeyValueObject): KeyValueTable => {
  return Object.entries(obj).map(([name, { description, type }]) => ({
    id: ++idCounter,
    name,
    description,
    type,
    selected: false
  }))
}

const getBodyObject = (inputRows: KeyValueTable): KeyValueObject => {
  const obj: KeyValueObject = {}
  for (const row of inputRows) {
    if (row.name && row.type) {
      if (row.type === 'array' && row.items) {
        obj[row.name] = {
          name: row.name,
          description: row.description || '',
          type: 'array'
          // 可根据需要，把数组项转成对象，暂时不展开
        }
      } else {
        obj[row.name] = {
          name: row.name,
          description: row.description || '',
          type: row.type
        }
      }
    }
  }
  return obj
}

const rows = ref<KeyValueTable>(objectToRows(props.modelValue))


watch(rows, (newRows) => {
  emit('update:modelValue', getBodyObject(newRows))
}, { deep: true })

onMounted(() => {
  if (rows.value.length === 0) {
    rows.value.push(createRow())
  }

  const maxId = Math.max(...rows.value.map(r => r.id), 0)
  if (maxId > idCounter) idCounter = maxId
})

const addRow = () => {
  rows.value.push(createRow())
}

const cloneSelected = () => {
  const selected = rows.value.filter(r => r.selected)
  rows.value.push(...selected.map(r => ({
    ...createRow(),
    name: r.name,
    description: r.description,
    type: r.type
  })))
}

const deleteSelected = () => {
  rows.value = rows.value.filter(r => !r.selected)
}

const resetRows = () => {
  rows.value = [createRow()]
}

const hasSelected = computed(() => rows.value.some(row => row.selected))

const typeList = [
  { id: 'string', name: 'String' },
  { id: 'number', name: 'Number' },
  { id: 'boolean', name: 'Boolean' },
  { id: 'array', name: 'Array' },
  { id: 'object', name: 'Object' }
]
</script>

<template>
  <div v-bind="$attrs" class="h-full   flex flex-col rounded-md border border-muted p-4">


    <div class="flex-1 overflow-auto">
      <Table class="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead class="w-[40px]">
              <Checkbox />
            </TableHead>
            <TableHead class="w-40">Name</TableHead>
            <TableHead class="w-96">Description</TableHead>
            <TableHead class="w-40">Type</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="(row, index) in rows" :key="row.id">
            <TableCell>
              <Checkbox v-model="row.selected" />
            </TableCell>
            <TableCell><Input v-model="row.name" placeholder="Field name" class=" dark" /></TableCell>
            <TableCell><Input v-model="row.description" placeholder="Describe this field..." class=" dark" /></TableCell>
            <TableCell>
              <Select v-model="row.type" placeholder="Type">
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent class="dark">
                  <SelectItem v-for="type in typeList" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>


        </TableBody>
      </Table>
    </div>

    <div class="mt-4 shrink-0 flex items-center justify-between border-t pt-4">
      <div class="flex items-center space-x-2">
        <Button variant="ghost" size="icon" @click="addRow">
          <NuxtIcon name="ic:round-add" class="text-xl" />
        </Button>
        <Button variant="ghost" size="icon" @click="cloneSelected" :disabled="!hasSelected">
          <NuxtIcon name="mdi:content-copy" class="text-xl" />
        </Button>
        <Button variant="ghost" size="icon" @click="deleteSelected" :disabled="!hasSelected">
          <NuxtIcon name="material-symbols:delete-outline" class="text-xl" />
        </Button>
        <Button variant="ghost" size="icon" @click="resetRows" :disabled="!hasSelected">
          <NuxtIcon name="mdi:restart" class="text-xl" />
        </Button>
      </div>
      <div class="text-sm text-muted-foreground">
        {{ rows.length }} row{{ rows.length !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>
