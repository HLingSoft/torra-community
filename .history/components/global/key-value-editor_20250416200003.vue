<script setup lang="ts">
const props = defineProps<{
    modelValue: KeyValueTable
}>()
interface KeyValueRow {
    id: number
    key: string
    value: string
    selected: boolean
}
const emit = defineEmits<{
    (e: 'update:modelValue', value: KeyValueTable): void
}>()
type KeyValueTable = KeyValueRow[]
type KeyValueObject = Record<string, string>
let idCounter = 0

const createRow = (): KeyValueRow => ({
    id: ++idCounter,
    key: '',
    value: '',
    selected: false
})

const rows = ref<KeyValueTable>(structuredClone(props.modelValue))
watch(rows, (newRows) => {
    emit('update:modelValue', newRows)
}, { deep: true })

const addRow = () => {
    rows.value.push(createRow())
}

const cloneSelected = () => {
    const selected = rows.value.filter(r => r.selected)
    rows.value.push(...selected.map(r => ({
        ...createRow(),
        key: r.key,
        value: r.value
    })))
}

const deleteSelected = () => {
    rows.value = rows.value.filter(r => !r.selected)
}

const resetRows = () => {
    rows.value = [createRow()]
}

const hasSelected = computed(() => rows.value.some(row => row.selected))
// 如果需要导出 body 数据，可暴露给外部使用
const getBodyObject = () => {
    const obj: Record<string, string> = {}
    for (const row of rows.value) {
        if (row.key && row.value) {
            obj[row.key] = row.value
        }
    }
    return obj
}

const convertToKeyValueObject = (rows: KeyValueRow[]): KeyValueObject => {
    const obj: KeyValueObject = {}
    for (const row of rows) {
        if (row.key && row.value) {
            obj[row.key] = row.value
        }
    }
    return obj
}
</script>
<template>
    <div class="h-full flex flex-col rounded-md border border-muted p-4">

        <!-- 顶部描述区域 -->
        <div class="mb-2 text-sm text-muted-foreground shrink-0">
            The body to send with the request as a dictionary (for POST, PATCH, PUT).
        </div>

        <!-- 中间表格区域 -->
        <div class="flex-1 overflow-auto">
            <Table class="min-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-[40px]">
                            <Checkbox />
                        </TableHead>
                        <TableHead class="w-60">Key</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow v-for="(row, index) in rows" :key="row.id">
                        <TableCell>
                            <Checkbox v-model="row.selected" />
                        </TableCell>
                        <TableCell>
                            <Input v-model="row.key" placeholder="Key" />
                        </TableCell>
                        <TableCell>
                            <Input v-model="row.value" placeholder="Value" />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <!-- 操作栏区域，固定底部 -->
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
