<script setup lang="ts">
import type { KeyValueRow } from '@/types/node-data/api-tool'


type KeyValueTable = KeyValueRow[]

const props = defineProps<{
    modelValue: KeyValueTable
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: KeyValueTable): void
}>()

let idCounter = 0

const createRow = (): KeyValueRow => ({
    id: ++idCounter,
    key: '',
    value: '',
    selected: false,
    description: '',
    type: 'string',
})

const createRowFrom = (base: Partial<KeyValueRow>): KeyValueRow => ({
    id: ++idCounter,
    key: base.key ?? '',
    value: base.value ?? '',
    selected: false,
    description: base.description ?? '',
    type: base.type ?? 'string',
})

const rows = ref<KeyValueTable>([])

// 初始化 rows
onMounted(() => {
    if (props.modelValue.length > 0) {
        rows.value = props.modelValue.map(r => createRowFrom(r))
    } else {
        rows.value.push(createRow())
    }

    const maxId = Math.max(...rows.value.map(r => r.id), 0)
    if (maxId > idCounter) idCounter = maxId
})

// 双向绑定
watch(
    rows,
    (newRows) => {
        emit('update:modelValue', newRows)
    },
    { deep: true }
)

const addRow = () => {
    rows.value.push(createRow())
}

const cloneSelected = () => {
    const selected = rows.value.filter(r => r.selected)
    rows.value.push(...selected.map(r => createRowFrom(r)))
}

const deleteSelected = () => {
    rows.value = rows.value.filter(r => !r.selected)
}

const resetRows = () => {
    rows.value = [createRow()]
}

const hasSelected = computed(() => rows.value.some(row => row.selected))
</script>

<template>
    <div v-bind="$attrs" class="h-full flex flex-col rounded-md border border-muted p-4">
        <div class="mb-2 text-sm text-muted-foreground shrink-0">
            The body to send with the request as a dictionary (for POST, PATCH, PUT).
        </div>

        <div class="flex-1 overflow-auto">
            <Table class="min-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-[40px]">
                            <Checkbox />
                        </TableHead>
                        <TableHead class="w-60">Key</TableHead>
                        <TableHead>Default Value</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead class="w-60">Type</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="row in rows" :key="row.id">
                        <TableCell>
                            <Checkbox v-model="row.selected" />
                        </TableCell>
                        <TableCell><Input v-model="row.key" placeholder="Key" /></TableCell>
                        <TableCell><Input v-model="row.value" placeholder="Default Value" /></TableCell>
                        <TableCell><Input v-model="row.description" placeholder="Description" /></TableCell>
                        <TableCell>
                            <Select v-model="row.type">
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent class="dark">
                                    <SelectGroup>
                                        <SelectItem value="string">String</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="boolean">Boolean</SelectItem>
                                        <SelectItem value="object">Object</SelectItem>
                                        <SelectItem value="array">Array</SelectItem>
                                    </SelectGroup>
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
