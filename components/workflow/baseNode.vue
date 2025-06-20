<script lang="ts" setup generic="T extends Record<string, any>">
import type { Node } from '@vue-flow/core'
import WorkflowNodeHistory, { EnumWorkflowNodeHistory } from '~/models/WorkflowNodeHistory'
import { nanoid } from 'nanoid'
import { useVueFlow } from '@vue-flow/core'
import type User from '~/models/User'
import type Workflow from '~/models/Workflow'

const props = defineProps<{
  id: string
  meta: Partial<T>
}>()

const emit = defineEmits<{
  (e: 'not-found'): void
}>()

const { project, addNodes } = useVueFlow()
const { nodes, executionErrorNodeIds, selectedNodeId, currentWorkflow } = storeToRefs(useWorkflowStore())
const currentNode = defineModel<{ id: string; data: T } | null>('currentNode')
const { user } = storeToRefs(useUserStore())

const originalNodeData = ref<T | null>(null)
const isDirty = ref(false)
const allWorkflowNodeHistory = ref<WorkflowNodeHistory[]>([])
const isHistoryDialogOpen = ref(false)

onMounted(() => {
  const node = nodes.value.find((n) => n.id === props.id)
  if (!node) {
    emit('not-found')
    return
  }

  const mergedData = {
    ..._.cloneDeep(props.meta),
    ..._.cloneDeep(node.data),
  } as T

  currentNode.value = {
    id: node.id,
    data: mergedData,
  }

  originalNodeData.value = _.cloneDeep(mergedData)
})

watch(
  () => currentNode.value?.data,
  (newVal) => {
    if (!newVal || !originalNodeData.value) {
      isDirty.value = false
      return
    }
    isDirty.value = !_.isEqual(newVal, originalNodeData.value)

    const idx = nodes.value.findIndex((n) => n.id === props.id)
    if (idx !== -1) {
      Object.assign(nodes.value[idx].data, _.cloneDeep(newVal))
    }
  },
  { immediate: true, deep: true }
)

watch(executionErrorNodeIds, () => {
  console.log('executionErrorNodeIds changed', executionErrorNodeIds.value)
})

const doSave = async () => {
  if (!currentNode.value) return

  const lastHistory = allWorkflowNodeHistory.value[0]
  if (lastHistory && _.isEqual(lastHistory.nodeData, currentNode.value.data)) {
    useToast('当前节点数据与最新历史记录一致，无需保存。')
    return
  }

  const history = new WorkflowNodeHistory()
  history.nodeId = props.id
  history.nodeData = _.cloneDeep(currentNode.value.data)
  history.user = user.value as User
  history.workflow = currentWorkflow.value as Workflow
  await history.save()

  allWorkflowNodeHistory.value.unshift(history)
  originalNodeData.value = _.cloneDeep(currentNode.value.data)
  isDirty.value = false

  useToast('节点数据已保存到历史记录。')
}

const doDuplicate = () => {
  if (!currentNode.value) return

  const nodeCount = nodes.value.length || 0
  const perRow = 10
  const x = 140 + 20 * (nodeCount % perRow)
  const y = 140 + 10 * (nodeCount % perRow)
  const position = project({ x, y })

  const newNode: Node = {
    id: nanoid(),
    type: 'custom',
    position,
    zIndex: 999,
    data: {
      ..._.cloneDeep(currentNode.value.data),
      title: `${currentNode.value.data.title} - Copy`,
      description: `${currentNode.value.data.description} - Copy`,
    },
  }

  addNodes(newNode)
  setTimeout(() => {
    selectedNodeId.value = newNode.id
  }, 0)
}

const doDelete = async () => {
  const ok = await useConfirm({
    title: '删除节点',
    description: '确定删除该节点及关联连线吗？',
    confirmText: '确定',
    cancelText: '取消',
  })
  if (ok) {
    nodes.value = nodes.value.filter((n) => n.id !== props.id)
    selectedNodeId.value = null
  }
}

const openHistoryDialog = async () => {
  isHistoryDialogOpen.value = true
  allWorkflowNodeHistory.value = await new LC.Query(WorkflowNodeHistory)
    .equalTo(EnumWorkflowNodeHistory.NODEID, props.id)
    .include(EnumWorkflowNodeHistory.USER)
    .find() as WorkflowNodeHistory[]

  allWorkflowNodeHistory.value.forEach((history) => {
    history.temp_createdAtStr = history.createdAt!.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  })
}

const deleteHistory = async (history: WorkflowNodeHistory) => {
  const ok = await useConfirm({
    title: '删除历史记录',
    description: '确定删除该历史记录吗？',
    confirmText: '删除',
    cancelText: '取消',
  })
  if (ok) {
    await history.destroy()
    allWorkflowNodeHistory.value = allWorkflowNodeHistory.value.filter(h => h.objectId !== history.objectId)
  }
}

const rollbackHistory = async (history: WorkflowNodeHistory) => {
  const ok = await useConfirm({
    title: '回退历史记录',
    description: '确定回退到该历史记录吗？',
    confirmText: '回退',
    cancelText: '取消',
  })
  if (ok && history.nodeData) {
    currentNode.value = {
      id: props.id,
      data: _.cloneDeep(history.nodeData) as T,
    }
    isHistoryDialogOpen.value = false
    useToast('节点数据已回退到选定的历史记录。')
  }
}
</script>

<template>
  <div class="relative">
    <div v-show="selectedNodeId && currentNode && selectedNodeId === id" class="fade-in-100 absolute z-50 -top-16 -left-10 rounded-xl bg-background border-1 px-5 py-2 flex flex-row items-center gap-x-5 text-white">
      <Button :variant="isDirty ? 'default' : 'ghost'" size="sm" @click="doSave">
        <NuxtIcon name="fluent:save-20-regular" size="18" />
        Save
      </Button>
      <Button variant="ghost" size="sm" @click="doDuplicate">
        <NuxtIcon name="bx:duplicate" size="18" />
        Duplicate
      </Button>
      <Button variant="ghost" size="sm" @click="openHistoryDialog">
        <NuxtIcon name="solar:history-bold-duotone" size="18" />
        History
      </Button>
      <Button variant="destructive" size="sm" @click="doDelete">
        <NuxtIcon name="fluent:delete-20-regular" size="18" />
        Delete
      </Button>
    </div>

    <Card v-if="currentNode && currentNode.data" :class="{
      'shadow-[rgba(219,219,219,0.66)] shadow-lg': id === selectedNodeId,
      'ring-8 ring-red-500': executionErrorNodeIds.includes(id),
    }" class="w-96 !pb-0 text-white bg-background rounded-lg group flex flex-col">
      <NodeCardHeader :nodeData="currentNode.data" :id="id" class="w-full" />
      <Separator />
      <CardContent class="text-white space-y-8 flex-1 nodrag nopan cursor-auto">
        <slot name="content" />
      </CardContent>
      <div class="w-full">
        <slot name="footer" />
      </div>
    </Card>

    <Dialog v-model:open="isHistoryDialogOpen">
      <DialogTrigger as-child />
      <DialogContent class="!max-w-3xl dark text-white">
        <DialogHeader>
          <DialogTitle>Histories</DialogTitle>
          <DialogDescription>Show the histories of the current node.</DialogDescription>
        </DialogHeader>
        <ScrollArea class="h-[50vh]">
          <div class="min-w-full overflow-x-auto">
            <Table class="min-w-full table-fixed">
              <TableCaption>
                {{ allWorkflowNodeHistory.length > 0
                  ? `Found ${allWorkflowNodeHistory.length} record(s)`
                  : 'No records found' }}
              </TableCaption>
              <thead class="sticky top-0 z-10">
                <TableRow>
                  <TableHead>CreatedAt</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead class="flex items-center justify-end space-x-2">Operator</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                <TableRow v-for="history in allWorkflowNodeHistory" :key="history.objectId">
                  <TableCell>{{ history.temp_createdAtStr }}</TableCell>
                  <TableCell>{{ history.user.name }}</TableCell>
                  <TableCell>
                    <div class="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="destructive" @click="deleteHistory(history)">删除</Button>
                      <Button size="sm" variant="outline" class="ml-2" @click="rollbackHistory(history)">回退</Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
