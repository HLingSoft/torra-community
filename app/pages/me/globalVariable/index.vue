<script setup lang="ts">
import UserWorkflowVariable, { EnumUserWorkflowVariable } from '~~/models/UserWorkflowVariable'
import User from '~~/models/User'
definePageMeta({
    layout: 'me',
    title: '全局变量',
})
const { user } = storeToRefs(useUserStore())
interface KeyValueRow {
    id: number
    name: string
    value: string // default value
    selected: boolean
    description: string
    type: 'string' | 'number' | 'boolean'
}

type KeyValueTable = KeyValueRow[]



let idCounter = 0

const createRow = (): KeyValueRow => ({
    id: ++idCounter,
    name: '',
    value: '',
    selected: false,
    description: '',
    type: 'string',
})

const createRowFrom = (base: Partial<KeyValueRow>): KeyValueRow => ({
    id: ++idCounter,
    name: base.name ?? '',
    value: base.value ?? '',
    selected: false,
    description: base.description ?? '',
    type: base.type ?? 'string',
})

const rows = ref<KeyValueTable>([])
const userVariables = ref<UserWorkflowVariable | null>(null)
const isFetching = ref(false)
// 初始化 rows
onMounted(async () => {
    isFetching.value = true
    await until(user).not.toBeNull()
    // 获取用户变量
    userVariables.value = await new LC.Query(UserWorkflowVariable)
        .equalTo(EnumUserWorkflowVariable.USER, user.value)
        .first() as UserWorkflowVariable
    // console.log('userVariables.value', userVariables.value)
    if (!userVariables.value) {
        userVariables.value = new UserWorkflowVariable()
        userVariables.value.user = user.value as User
        userVariables.value.variables = []
        await userVariables.value.save()
    }
    const raw = userVariables.value.variables as { [key: string]: any }[]
    rows.value = raw.map((item, index) => ({
        id: index + 1,
        name: String(item.name ?? ''),
        value: String(item.value ?? ''),
        selected: false,
        description: String(item.description ?? ''),
        type: ['string', 'number', 'boolean'].includes(item.type) ? item.type : 'string'
    }))

    const maxId = Math.max(...rows.value.map(r => r.id), 0)
    if (maxId > idCounter) idCounter = maxId

    isFetching.value = false
})


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

const save = async () => {


    if (userVariables.value) {
        userVariables.value!.variables = rows.value
        await userVariables.value.save()
        useToast('全局变量已保存')
    }


}
</script>

<template>
    <div class="flex flex-col items-start space-y-2 p-6 w-full   h-full">
        <div class="mb-6 text-sm  shrink-0 flex items-center justify-between w-full">
            <div class="">
                <h3 class="text-lg font-medium">
                    Global Variables
                </h3>
                <p class="text-sm text-muted-foreground">
                    Define global variables that can be used across your application. These variables can be referenced in your API tools, workflows, and other components.
                </p>
            </div>
            <Button @click="save">
                <NuxtIcon name="lucide:check-line" class="mr-2" />
                Save
            </Button>
        </div>
        <Separator class="mb-4" />
        <div class="flex-1   w-full">

            <Table class="h-full w-full  ">
                <TableHeader class="shrink-0 w-full">
                    <TableRow class="w-full    ">
                        <TableHead class="w-[40px]">
                            <Checkbox />
                        </TableHead>
                        <TableHead class="w-60">Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead class="w-60">Type</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody class="w-full ">

                    <TableRow v-for="row in rows" :key="row.id" class="hover:bg-accent w-full   ">
                        <TableCell>
                            <Checkbox v-model="row.selected" />
                        </TableCell>
                        <TableCell><Input v-model="row.name" placeholder="Name" /></TableCell>
                        <TableCell><Input v-model="row.value" placeholder="Value" /></TableCell>
                        <TableCell><Input v-model="row.description" placeholder="Description" /></TableCell>
                        <TableCell>
                            <Select v-model="row.type">
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="string">String</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="boolean">Boolean</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>

                </TableBody>

            </Table>
        </div>

        <div class="mt-4 shrink-0 flex items-center justify-between border-t pt-4 w-full">
            <div class="flex items-center space-x-2">
                <Button variant="ghost" size="icon" @click="addRow">
                    <NuxtIcon name="ic:round-add" class="text-xl" />
                </Button>
                <Button variant="ghost" size="icon" @click="deleteSelected" :disabled="!hasSelected">
                    <NuxtIcon name="material-symbols:delete-outline" class="text-xl" />
                </Button>
                <Button variant="ghost" size="icon" @click="cloneSelected" :disabled="!hasSelected">
                    <NuxtIcon name="mdi:content-copy" class="text-xl" />
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
