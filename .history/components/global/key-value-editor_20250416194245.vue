<script setup lang="ts">

interface KeyValueRow {
    id: number
    key: string
    value: string
    selected: boolean
}

type KeyValueTable = KeyValueRow[]
type KeyValueObject = Record<string, string>
let idCounter = 0

const createRow = (): KeyValueRow => ({
    id: ++idCounter,
    key: '',
    value: '',
    selected: false
})

const rows = ref<KeyValueRow[]>([
    createRow()
])

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
    <div class="rounded-md border border-muted p-4 ">
        <div class="mb-2 text-sm text-muted-foreground">
            The body to send with the request as a dictionary (for POST, PATCH, PUT).
        </div>

        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="w-[40px]">
                        <Checkbox />
                    </TableHead>
                    <TableHead>Key</TableHead>
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

        <div class="mt-4 flex items-center justify-between border-t pt-4">
            <div class="flex items-center space-x-2">
                <Button variant="ghost" size="icon" @click="addRow">
                    <NuxtIcon name="ic:round-add" class="text-xl" />
                </Button>
                <Button variant="ghost" size="icon" @click="cloneSelected">
                    <NuxtIcon name="mdi:content-copy" class="text-xl" />
                </Button>
                <Button variant="ghost" size="icon" @click="deleteSelected">
                    <NuxtIcon name="material-symbols:delete-outline" class="text-xl" />
                </Button>
                <Button variant="ghost" size="icon" @click="resetRows">
                    <NuxtIcon name="mdi:restart" class="text-xl" />
                </Button>
            </div>
            <div class="text-sm text-muted-foreground">
                {{ rows.length }} row{{ rows.length !== 1 ? 's' : '' }}
            </div>
        </div>
    </div>
</template>
