<script lang="ts" setup>

import User from '~~/models/User'
import { useVueFlow } from '@vue-flow/core'
import Workflow, { EnumWorkflow } from '~~/models/Workflow'
import UserWorkspace from '~~/models/UserWorkspace'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import WorkflowHistory, { EnumWorkflowHistory } from '~~/models/WorkflowHistory'
import WorkflowRunLog, { EnumWorkflowRunLog } from '~~/models/WorkflowRunLog'
import WorkflowUserShare, { EnumWorkflowUserShare } from '~~/models/WorkflowUserShare'
const { t } = useI18n()



const { vueFlowRef } = useVueFlow();
const { nodes, edges, currentWorkflow, capturingScreenshotMode } = storeToRefs(useWorkflowStore())

const { user, currentWorkspace } = storeToRefs(useUserStore())
const history = useWorkflowHistoryStore()
const { logOut } = useUserStore()
const { copy } = useClipboard()
const { mini, toggle } = useMiniNode()
const playWorkflow = async () => {
  if (currentWorkflow.value && (currentWorkflow.value.temp_isMine || currentWorkflow.value.temp_editable)) {

    await saveWorkflow()
  }


  playgroundOpen.value = true

}
const allWorkflows = ref<Workflow[]>([])


onMounted(async () => {


  const route = useRoute() // 获取当前路由对象


  const workflowId = route.query.workflowId
  await until(user).toBeTruthy()
  await until(currentWorkspace).toBeTruthy()


  allWorkflows.value = await new LC.Query(Workflow).include(EnumWorkflow.USER).include(EnumWorkflow.WORKSPACE).equalTo(EnumWorkflow.USER, user.value).equalTo(EnumWorkflow.WORKSPACE, currentWorkspace.value).descending(EnumWorkflow.UPDATEDAT).find()
  const meJoinedWorkflows = await new LC.Query(WorkflowUserShare).include(EnumWorkflowUserShare.WORKFLOW).include(EnumWorkflowUserShare.USER).equalTo(EnumWorkflowUserShare.USER, user.value).find() as WorkflowUserShare[]

  //把 meJoinedWorkflows 中的 workflow 加入到 allWorkflows 中
  meJoinedWorkflows.forEach((share: WorkflowUserShare) => {
    if (!allWorkflows.value.some(workflow => workflow.objectId === share.workflow.objectId)) {
      share.workflow.temp_editable = share.editable // 给 workflow 加上 temp_editable 属性
      allWorkflows.value.push(share.workflow)
    }
  })
  //再判断 allWorkflows 中是否有重复的 workflow，如果有，则去重
  allWorkflows.value = allWorkflows.value.filter((workflow, index, self) =>
    index === self.findIndex((w) => w.objectId === workflow.objectId)
  )

  //给 workflow 加上 temp_isMine 属性
  allWorkflows.value.forEach((workflow: Workflow) => {
    workflow.temp_isMine = workflow.user.objectId === user.value?.objectId

  })
  if (workflowId) {
    currentWorkflow.value = allWorkflows.value.find((workflow: Workflow) => workflow.objectId === workflowId) || undefined
  } else {
    currentWorkflow.value = allWorkflows.value.length > 0 ? allWorkflows.value[0] : undefined // await new LC.Query(Workflow).equalTo(EnumWorkflow.USER, user.value).equalTo(EnumWorkflow.WORKSPACE, currentWorkspace.value).first()

  }


  if (!currentWorkflow.value) {
    currentWorkflow.value = new Workflow()
    currentWorkflow.value.user = user.value as User
    currentWorkflow.value.name = 'My First Workflow'
    currentWorkflow.value.description = 'My First Workflow Description'
    currentWorkflow.value.nodes = []
    currentWorkflow.value.edges = []
    currentWorkflow.value.workspace = currentWorkspace.value as UserWorkspace
    await currentWorkflow.value.save()
  }
  else {
    nodes.value = currentWorkflow.value.nodes

    edges.value = currentWorkflow.value.edges
    console.log('currentWorkflow.value', currentWorkflow.value)
    // useVueFlow().setNodes(currentWorkflow.value.nodes)

  }








})

const playgroundOpen = ref(false)
const userlogOut = async () => {

  const confirmed = await useConfirm({
    title: '退出登录',
    description: '确定要退出登录吗？',
  })

  if (confirmed) {
    // 执行退出逻辑
    logOut()
    user.value = null
    currentWorkspace.value = undefined
    navigateTo('/')
  }

}
const isCreateWorkflowDialogOpen = ref(false)
watch(isCreateWorkflowDialogOpen, () => {
  if (isCreateWorkflowDialogOpen.value) {
    // 打开对话框时，清空工作流数据
    newWorkflow.value = new Workflow()
    uploadedFile.value = null
  }
})

const isEditDetailsDialogOpen = ref(false)
const newWorkflow = ref<Workflow>(new Workflow())
const saveNewWorkflow = async () => {


  if (!newWorkflow.value.name) {
    useToast('工作流名称不能为空')
    return
  }
  if (!newWorkflow.value.description) {
    useToast('工作流描述不能为空')
    return
  }
  if (!newWorkflow.value.nodes) {
    newWorkflow.value.nodes = []
  }
  if (!newWorkflow.value.edges) {
    newWorkflow.value.edges = []
  }
  newWorkflow.value.user = user.value as User
  newWorkflow.value.workspace = currentWorkspace.value as UserWorkspace
  await newWorkflow.value.save()
  allWorkflows.value.push(newWorkflow.value)

  useToast('新建工作流成功')

  // newWorkflow.value = new Workflow()
  isCreateWorkflowDialogOpen.value = false
  await nextTick()
  currentWorkflow.value = await new LC.Query(Workflow).include(EnumWorkflow.WORKSPACE).include(EnumWorkflow.USER).get(newWorkflow.value.objectId)
}
const saveCureentWorkflow = async () => {
  if (!currentWorkflow.value) {
    return
  }
  if (!currentWorkflow.value.name) {
    useToast('工作流名称不能为空')
    return
  }
  if (!currentWorkflow.value.description) {
    useToast('工作流描述不能为空')
    return
  }


  await currentWorkflow.value?.save()
  useToast('修改工作流基础成功')
  isEditDetailsDialogOpen.value = false
  //修改 allWorkflows 中的当前工作流
  const index = allWorkflows.value.findIndex((workflow: Workflow) => workflow.objectId === currentWorkflow.value?.objectId)
  if (index !== -1) {
    allWorkflows.value[index] = currentWorkflow.value as Workflow
  }
}

const saveWorkflow = async () => {
  // console.log('Saving current workflow:', nodes.value)
  // currentWorkflow.value!.nodes = nodes.value
  // currentWorkflow.value!.edges = edges.value

  // 1. 生成新副本，添加 saved 字段
  const nodesCopy = nodes.value.map(node => ({
    ...node,
    data: { ...node.data, saved: true }
  }))
  const edgesCopy = edges.value.map(edge => ({
    ...edge,
    data: { ...edge.data, saved: true }
  }))
  // console.log('Saving nodesCopy:', nodesCopy)
  // 2. 覆盖 workflow 对象
  currentWorkflow.value!.nodes = nodesCopy
  currentWorkflow.value!.edges = edgesCopy
  // 3. 保存
  await currentWorkflow.value?.save()
  useToast('保存工作流成功')
}
const deleteWorkflow = async () => {

  const confirmed = await useConfirm({
    title: '删除工作流',
    description: '确定要删除工作流吗？',
  })

  if (confirmed) {
    await currentWorkflow.value?.destroy()
    useToast('删除工作流成功')
    allWorkflows.value = allWorkflows.value.filter((workflow: Workflow) => workflow.objectId !== currentWorkflow.value?.objectId)
    currentWorkflow.value = allWorkflows.value[0] || new Workflow()
  }
}


async function exportWorkflow() {
  const confirmed = await useConfirm({
    title: '导出工作流',
    description: '确定要导出工作流吗？',
  })

  if (confirmed) {
    if (!currentWorkflow.value) {
      useToast('没有工作流可供导出')
      return
    }
    const blob = new Blob([JSON.stringify({
      nodes: currentWorkflow.value.nodes,
      edges: currentWorkflow.value.edges,
      name: currentWorkflow.value.name,
      description: currentWorkflow.value.description,
    })], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Torra-${currentWorkflow.value.name}-工作流.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}
const uploadedFile = ref<File | null>(null)
// const fileUploadData = ref<ExportedWorkflow | null>(null)
async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadedFile.value = file
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result as string)
      if (!parsed.nodes || !parsed.edges) {
        useToast('不是合法的工作流文件')
        return
      }
      newWorkflow.value.nodes = parsed.nodes
      newWorkflow.value.edges = parsed.edges
      // if (_.isEmpty(newWorkflow.value.name)) {
      newWorkflow.value.name = `${parsed.name} (副本)`
      // }
      // if (_.isEmpty(newWorkflow.value.description)) {
      newWorkflow.value.description = `${parsed.description} (副本)`
      // }

    } catch (err) {
      console.error('❌ JSON 解析失败:', err)
      useToast('文件格式不正确，请确认是导出的工作流文件')
      return
    }
  }
  reader.readAsText(uploadedFile.value)


}

const showAPIDialog = ref(false)

const playAPI = async () => {
  if (currentWorkflow.value && (currentWorkflow.value.temp_isMine || currentWorkflow.value.temp_editable)) {

    await saveWorkflow()
  }
  showAPIDialog.value = true
}


const isHistoryDialogOpen = ref(false)
const currentWorkflowHistories = ref<WorkflowHistory[]>([])
watch(isHistoryDialogOpen, async () => {
  if (isHistoryDialogOpen.value) {
    if (!currentWorkflow.value) {
      return
    }
    currentWorkflowHistories.value = await new LC.Query(WorkflowHistory).include(EnumWorkflowHistory.USER).equalTo(EnumWorkflowHistory.WORKFLOW, currentWorkflow.value).descending(EnumWorkflow.CREATEDAT).limit(1000).find()


    currentWorkflowHistories.value.map((history: WorkflowHistory) => {
      history.temp_createdAtStr = history.createdAt!.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    })
  }
})

const deleteHistory = async (history: WorkflowHistory) => {
  if (history.user.objectId !== user.value?.objectId) {
    useToast('只能删除自己的历史记录')
    return
  }
  const confirmed = await useConfirm({
    title: '删除历史记录',
    description: '确定要删除历史记录吗？',
  })

  if (confirmed) {
    await history.destroy()
    useToast('删除历史记录成功')
    currentWorkflowHistories.value = currentWorkflowHistories.value.filter((h: WorkflowHistory) => h.objectId !== history.objectId)
  }
}

const rollbackHistory = async (history: WorkflowHistory) => {
  if (history.user.objectId !== user.value?.objectId) {
    useToast('只能回退自己的历史记录')
    return
  }
  const confirmed = await useConfirm({
    title: '回退历史记录',
    description: `确定要回退到${history.version}历史记录吗？`,
  })

  if (confirmed) {
    currentWorkflow.value!.nodes = history.nodes
    currentWorkflow.value!.edges = history.edges
    await currentWorkflow.value?.save()
    useToast('回退工作流成功')
    isHistoryDialogOpen.value = false
  }
}

const isLogsDialogOpen = ref(false)
const allCurrentWorkflowLogs = ref<WorkflowRunLog[]>([])
watch(isLogsDialogOpen, async () => {
  if (isLogsDialogOpen.value) {
    if (!currentWorkflow.value) {
      return
    }
    allCurrentWorkflowLogs.value = await new LC.Query(WorkflowRunLog).include(EnumWorkflowRunLog.USER).equalTo(EnumWorkflowRunLog.WORKFLOW, currentWorkflow.value).descending(EnumWorkflowRunLog.CREATEDAT).limit(10).find()
  }
})

const copyLogs = async (logs: Array<any>) => {
  await copy(JSON.stringify(logs, null, 2))
  useToast('Logs 复制成功')
}
const copyResult = async (result: string) => {
  await copy(result)
  useToast('Result 复制成功')
}

const copyWorkflow = async () => {
  const confirmed = await useConfirm({
    title: '复制工作流',
    description: '确定要复制当前工作流吗？',
  })
  if (confirmed) {
    if (!currentWorkflow.value) {
      useToast('没有工作流可供复制')
      return
    }
    const newWorkflowCopy = new Workflow()
    newWorkflowCopy.name = `${currentWorkflow.value.name} (副本)`
    newWorkflowCopy.description = currentWorkflow.value.description
    newWorkflowCopy.nodes = currentWorkflow.value.nodes
    newWorkflowCopy.edges = currentWorkflow.value.edges
    newWorkflowCopy.user = user.value as User
    newWorkflowCopy.workspace = currentWorkspace.value as UserWorkspace
    await newWorkflowCopy.save()
    allWorkflows.value.push(newWorkflowCopy)
    useToast('复制工作流成功')
    currentWorkflow.value = newWorkflowCopy
  }
}
const isShareDialogOpen = ref(false)
const copyShareLink = async () => {
  if (!currentWorkflowShareLink.value) return
  await copy(currentWorkflowShareLink.value)
  useToast('分享链接已复制到剪贴板')
}
const currentWorkflowShareLink = ref<string | undefined>(undefined)
const allWorkflowUserShares = ref<WorkflowUserShare[]>([])
watch(currentWorkflow, async () => {
  if (currentWorkflow.value) {

    allWorkflowUserShares.value = await new LC.Query(WorkflowUserShare).include(EnumWorkflowUserShare.USER).equalTo(EnumWorkflowUserShare.WORKFLOW, currentWorkflow.value).find()
    allWorkflowUserShares.value.map((share: WorkflowUserShare) => {
      share.temp_operationType = share.editable ? EnumShareOperationType.EDIT : EnumShareOperationType.VIEW
    })

  }
})
const shareWorkflow = async () => {

  currentWorkflowShareLink.value = currentWorkflow.value ? `${window.location.origin}/workflow/join?workflow=${currentWorkflow.value.objectId}&from=${user.value!.objectId}` : undefined


  isShareDialogOpen.value = true
}

enum EnumShareOperationType {
  VIEW = 'view',
  EDIT = 'edit'
}
const shareOperationTypes = [
  { name: '查看', value: EnumShareOperationType.VIEW },
  { name: '编辑', value: EnumShareOperationType.EDIT }
]
const onOpTypeChange = async (share: WorkflowUserShare) => {
  console.log(`用户 ${share.user.name} 权限变为`, share.temp_operationType);
  if (share.temp_operationType === EnumShareOperationType.VIEW) {
    share.editable = false
    // return
  }
  if (share.temp_operationType === EnumShareOperationType.EDIT) {
    share.editable = true
    // return
  }
  await share.save()

}
const canEditCurrentWorkflow = computed(() => {

  let flag = false
  if (user.value?.objectId === currentWorkflow.value?.user.objectId) {
    flag = true
  }

  if (allWorkflowUserShares.value.some(share => share.user.objectId === user.value?.objectId && share.editable)) {
    flag = true
  }


  return flag

})




</script>

<template>
  <div class="  flex flex-col min-h-screen h-screen ">

    <ClientOnly>
      <div class="flex flex-1 min-h-0 h-0">
        <SidebarProvider>
          <WorkflowSidebar />
          <SidebarInset class="flex-1 min-h-0 flex flex-col relative">

            <header class=" flex fixed z-50 w-full py-5  top-0  bg-background h-16 shrink-0 items-center gap-2 border-b border-[hsl(var(--border))] px-4">
              <div class="flex items-center    space-x-2">
                <SidebarTrigger class="-ml-1 " />

              </div>
              <Separator orientation="vertical" class="mr-2 h-3   " />





              <div class="2xl:w-96 w-60 ">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button size="sm" variant="outline" class="w-full ">

                      <div v-if="currentWorkflow" class="flex flex-col gap-0.5 leading-none truncate">

                        <span class="text-xs ">{{ currentWorkflow.name }}</span>
                      </div>
                      <div v-else>

                        <Skeleton class="h-2 w-32 rounded-full bg-muted" />
                      </div>
                      <ChevronsUpDown class="ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="2xl:w-96 w-60   py-2" align="start">
                    <div class="max-h-96 overflow-y-auto">
                      <DropdownMenuLabel class="  text-xs text-muted-foreground mb-1  flex">
                        <div>{{ t('Created') }} ({{allWorkflows.filter(workflow => workflow.temp_isMine).length}})</div>
                      </DropdownMenuLabel>
                      <div v-if="allWorkflows.filter(workflow => workflow.temp_isMine).length === 0" class="flex flex-row items-center justify-center my-2">Empty</div>
                      <DropdownMenuItem v-for="(workflow, index) in allWorkflows.filter(workflow => workflow.temp_isMine)" :key="workflow.objectId" :class="{ 'text-primary': workflow.objectId === currentWorkflow?.objectId }" class="w-full py-2   max-w-96 text-sm flex flex-row items-center justify-between" @select="currentWorkflow = workflow">
                        <div class="text-xs font-light  2xl:text-sm line-clamp-2 2xl:line-clamp-1"> {{ index + 1 }}. {{ workflow.name }}</div>
                        <div class="flex items-center  gap-x-2 ">

                          <Check v-if="workflow.objectId === currentWorkflow?.objectId" class="ml-auto text-primary" />

                        </div>


                      </DropdownMenuItem>
                      <Separator class="my-0.5   " />
                      <DropdownMenuLabel class=" text-xs text-muted-foreground flex my-1">
                        <div>{{ t('Joined') }} ({{allWorkflows.filter(workflow => !workflow.temp_isMine).length}})</div>
                      </DropdownMenuLabel>
                      <div v-if="allWorkflows.filter(workflow => !workflow.temp_isMine).length === 0" class="flex flex-row items-center justify-center my-2">Empty</div>
                      <DropdownMenuItem v-for="(workflow, index) in allWorkflows.filter(workflow => !workflow.temp_isMine)" :key="workflow.objectId" :class="{ 'text-primary': workflow.objectId === currentWorkflow?.objectId }" class="w-full py-2   max-w-96 text-sm flex flex-row items-center justify-between" @select="currentWorkflow = workflow">
                        <div class="text-xs  2xl:text-sm line-clamp-2 2xl:line-clamp-1 max-w-72"> {{ index + 1 }}. {{ workflow.name }}</div>
                        <div class="flex items-center  gap-x-2 ">

                          <Check v-if="workflow.objectId === currentWorkflow?.objectId" class="ml-auto text-primary" />
                          <div class="text-xs text-muted-foreground ">{{ workflow.temp_editable ? t('Editor') : t("Viewer") }}</div>
                        </div>


                      </DropdownMenuItem>

                    </div>
                    <!-- <Separator class="my-2   " /> -->
                    <Dialog v-model:open="isCreateWorkflowDialogOpen">
                      <DialogTrigger as-child>

                        <Button size="sm" class="hidden md:flex ml-2 mt-2">
                          <div class="flex items-center space-x-2 ">
                            <NuxtIcon name="ic:round-add" size="18" />
                            <div class="">{{ t('Create New Workflow') }}</div>
                          </div>
                        </Button>

                      </DialogTrigger>
                      <DialogContent class=" max-w-72  ">
                        <DialogHeader>
                          <DialogTitle>{{ t('Create New Workflow') }}</DialogTitle>
                          <DialogDescription>
                            {{ t('Create a new workflow by filling out the form below. You can add nodes and edges to your workflow after creating it.') }}

                          </DialogDescription>
                        </DialogHeader>
                        <div class="grid gap-4 py-4">
                          <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="name" class="text-right">
                              Name
                            </Label>
                            <Input id="name" v-model="newWorkflow.name" class="col-span-3 !text-sm" />
                          </div>
                          <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="description" class="text-right">
                              Description
                            </Label>
                            <Textarea id="description" v-model="newWorkflow.description" class="col-span-3 !text-sm" />
                          </div>

                          <Separator class="my-2" />
                          <p class="text-muted-foreground text-xs">你也可以导入其他项目的工作流文件</p>
                          <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="file" class="text-right">
                              JSON File
                            </Label>
                            <Input id="file" type="file" accept=".json" @change="handleFileChange" class="  col-span-3" />
                          </div>




                        </div>
                        <DialogFooter>
                          <Button @click="saveNewWorkflow">
                            {{ $t('Save') }}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                  </DropdownMenuContent>

                </DropdownMenu>

              </div>



              <div class="flex gap-x-5 ml-5">

                <Button :disabled="!currentWorkflow || !canEditCurrentWorkflow" size="sm" variant="outline" class="hidden md:flex " @click="saveWorkflow">
                  <div class="flex items-center space-x-2 ">
                    <NuxtIcon name="fluent:save-20-regular" size="18" />
                    <div>{{ t('Save') }} </div>
                  </div>
                </Button>




                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button :disabled="!currentWorkflow || !currentWorkflow.objectId" size="sm" variant="outline" class="hidden md:flex ">
                      <div class="flex items-center space-x-2  w-32 justify-center">
                        <NuxtIcon name="icon-park-outline:more" size="18" />
                        <div>{{ t('Options') }}</div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="  space-y-1.5 py-2 w-36" align="center">

                    <DropdownMenuItem>
                      <div @click="isEditDetailsDialogOpen = true" v-if="canEditCurrentWorkflow" class="flex items-center space-x-2">
                        <NuxtIcon name="mynaui:edit" size="19" />
                        <p>{{ t('Edit Details') }}</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div @click="isHistoryDialogOpen = true" class="flex items-center space-x-2 ">
                        <NuxtIcon name="solar:history-bold-duotone" size="19" />
                        <p>{{ t('Histories') }}</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div class="flex items-center space-x-2 " @click="isLogsDialogOpen = true">
                        <NuxtIcon name="material-symbols-light:logo-dev-outline-rounded" size="19" />
                        <p>{{ t('Logs') }}</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <div class="flex items-center space-x-2" @click="exportWorkflow">
                        <NuxtIcon name="solar:export-line-duotone" size="19" />
                        <p>{{ t('Export') }}</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div @click="history.undo" :class="{ ' opacity-35 cursor-not-allowed': !history.canUndo }" class="flex items-center space-x-2  ">

                        <NuxtIcon name="material-symbols-light:undo" size="19" />
                        <p>Undo</p>
                        <div class="ml-6 flex items-center text-muted-foreground font-light text-xs">
                          <NuxtIcon name="material-symbols:keyboard-command-key" size="12" />
                          <p>+Y</p>
                        </div>

                      </div>
                    </DropdownMenuItem>


                    <DropdownMenuItem>
                      <div @click="history.redo" :class="{ ' opacity-35 cursor-not-allowed': !history.canRedo }" class="flex items-center space-x-2">
                        <NuxtIcon name="material-symbols-light:redo-rounded" size="19" />
                        <p>Redo</p>
                        <div class="ml-6 flex items-center text-muted-foreground font-light text-xs">
                          <NuxtIcon name="material-symbols:keyboard-command-key" size="12" />
                          <p>+Z</p>
                        </div>
                      </div>
                    </DropdownMenuItem>



                    <DropdownMenuSeparator class="my-1" />

                    <DropdownMenuItem>
                      <div class="flex items-center  space-x-2  cursor-pointer" @click="shareWorkflow">
                        <NuxtIcon name="solar:share-line-duotone" size="18" />
                        <div>{{ t('Share') }}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div class="flex items-center space-x-2  cursor-pointer" @click="copyWorkflow">
                        <NuxtIcon name="fluent:row-child-20-regular" size="18" />
                        <div>{{ t('Copy') }}</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <div v-if="canEditCurrentWorkflow" class="flex items-center space-x-2 text-destructive cursor-pointer" @click="deleteWorkflow">
                        <NuxtIcon name="fluent:delete-24-regular" size="18" />
                        <div>{{ t('Delete') }}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>


                <Button :disabled="!currentWorkflow || !currentWorkflow.objectId" size="sm" variant="destructive" class="hidden md:flex " @click="playWorkflow">
                  <div class="flex items-center space-x-2">
                    <NuxtIcon name="solar:play-broken" size="18" />
                    <div>{{ t('Playground') }}</div>
                  </div>
                </Button>
                <Button :disabled="!currentWorkflow || !currentWorkflow.objectId" size="sm" variant="link" class="hidden md:flex   " @click="playAPI()">
                  <div class="flex items-center space-x-2">
                    <NuxtIcon name="solar:code-2-line-duotone" size="18" />
                    <div>{{ t('API') }}</div>
                  </div>
                </Button>
              </div>


            </header>


            <div class="flex fixed z-50 right-4 top-0   h-16 items-center justify-center">

              <div class="w-28 2xl:w-40 flex items-center justify-center">
                <LanguageSwitch />
              </div>
              <div class="w-28 gap-x-4   flex items-center justify-center">
                <ColorSwitch />
                <label class="swap">

                  <input type="checkbox" :checked="mini" @change="toggle" />


                  <NuxtIcon name="solar:eye-line-duotone" size="20" class="swap-on fill-current" />


                  <NuxtIcon name="lets-icons:view-hide-duotone" size="20" class="swap-off fill-current" />
                </label>
              </div>


              <DropdownMenu v-if="user">
                <DropdownMenuTrigger as-child @click.stop>
                  <Button variant="secondary" size="icon" class="rounded-full">
                    <div class="avatar online ">
                      <div class="w-6 rounded-full ring ring-offset-2 ring-white ring-offset-base-100">
                        <img :src="user.avatar" />
                      </div>
                    </div>
                    <span class="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56 space-y-3  " align="center" side="bottom">
                  <DropdownMenuLabel class="font-normal flex">
                    <div class="flex flex-col  items-center my-2">
                      <Label class="text-sm font-medium leading-none">
                        {{ user.name }}
                      </Label>



                    </div>
                  </DropdownMenuLabel>

                  <Separator class="w-full" />

                  <NuxtLink to="/me/profile" target="_blank" class="w-full">
                    <DropdownMenuItem class="cursor-pointer  py-2.5">
                      <NuxtIcon name="iconamoon:profile-light" size="18" /> 个人信息
                    </DropdownMenuItem>
                  </NuxtLink>



                  <NuxtLink to="/me/finance" target="_blank" class="w-full">
                    <DropdownMenuItem class="cursor-pointer  py-2.5">
                      <NuxtIcon name="hugeicons:money-bag-01" size="18" /> 财务中心
                    </DropdownMenuItem>
                  </NuxtLink>

                  <!-- <DropdownMenuItem :disabled="true" class="cursor-pointer  py-2.5">
                    <NuxtIcon name="hugeicons:money-bag-01" size="18" />财务中心
                  </DropdownMenuItem> -->

                  <DropdownMenuItem class="cursor-pointer py-2.5" @click="userlogOut">
                    <NuxtIcon name="ant-design:logout-outlined" size="18" />退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>

            <main id="vueflowmain" class="flex-1 min-h-0 relative">
              <slot />
            </main>


            <Dialog v-if="currentWorkflow" :open="playgroundOpen" @update:open="playgroundOpen = $event">

              <DialogContent class="     w-full !max-w-7xl text-sm !h-[90vh]  grid grid-rows-[auto_1fr_auto] ">
                <DialogHeader>
                  <DialogTitle>{{ currentWorkflow.name }}</DialogTitle>
                  <DialogDescription>
                    {{ currentWorkflow.description }}
                  </DialogDescription>
                </DialogHeader>


                <WorkflowPlayground :workflow="currentWorkflow" class="overflow-hidden " />


              </DialogContent>
            </Dialog>


            <Dialog v-model:open="isEditDetailsDialogOpen">
              <DialogTrigger as-child>


              </DialogTrigger>
              <DialogContent v-if="currentWorkflow" class="sm:max-w-[425px]   ">
                <DialogHeader>
                  <DialogTitle>{{ t('Edit Current Workflow') }}</DialogTitle>
                  <DialogDescription>
                    {{ t('Edit the details of the current workflow by filling out the form below.') }}
                  </DialogDescription>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="name" class="text-right">
                      {{ t('Name') }}
                    </Label>
                    <Input id="name" v-model="currentWorkflow.name" class="col-span-3 !text-sm" />
                  </div>
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="description" class="text-right">
                      {{ t('Description') }}
                    </Label>
                    <Textarea id="description" v-model="currentWorkflow.description" class="col-span-3 !text-sm" />
                  </div>
                </div>
                <DialogFooter>
                  <Button @click="saveCureentWorkflow">
                    {{ t('Update') }}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>


            <Dialog v-model:open="isHistoryDialogOpen">
              <DialogTrigger as-child>


              </DialogTrigger>
              <DialogContent v-if="currentWorkflow" class="!max-w-7xl      ">
                <DialogHeader>
                  <DialogTitle>{{ t('Histories') }}</DialogTitle>
                  <DialogDescription>
                    {{ t('Show the histories of the current workflow.') }}
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea class="h-[50vh] ">
                  <div class="min-w-full overflow-x-auto">
                    <Table class="min-w-full table-fixed">
                      <TableCaption>
                        {{ currentWorkflowHistories.length > 0 ? `Found ${currentWorkflowHistories.length} record(s)` : 'No records found' }}
                      </TableCaption>


                      <thead class="sticky top-0   z-10">
                        <TableRow>
                          <TableHead class="w-1/3">{{ t('Version') }}</TableHead>
                          <TableHead>{{ t('CreatedAt') }}</TableHead>
                          <TableHead>{{ t('User') }}</TableHead>
                          <TableHead class="flex items-center justify-end space-x-2">{{ t('Operator') }}</TableHead>
                        </TableRow>
                      </thead>

                      <TableBody>
                        <TableRow v-for="history in currentWorkflowHistories" :key="history.objectId">
                          <TableCell class="font-medium w-1/3">
                            {{ history.version }}
                          </TableCell>
                          <TableCell>{{ history.temp_createdAtStr }}</TableCell>
                          <TableCell>{{ history.user.name }}</TableCell>
                          <TableCell>
                            <div class="flex items-center justify-end space-x-2">
                              <Button size="sm" variant="destructive" @click="deleteHistory(history)">{{ t('Delete') }}</Button>
                              <Button size="sm" variant="outline" class="ml-2" @click="rollbackHistory(history)">{{ t('Rollback') }}</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>

                    </Table>
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <DialogClose as-child>
                    <Button type="button" variant="secondary">
                      {{ t('Close') }}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>


            <Dialog v-model:open="isLogsDialogOpen">
              <DialogTrigger as-child>


              </DialogTrigger>
              <DialogContent v-if="currentWorkflow" class="!max-w-7xl     ">
                <DialogHeader>
                  <DialogTitle>{{ t('Logs') }}</DialogTitle>
                  <DialogDescription>
                    {{ t('Show the logs of the current workflow.') }} {{ t('Show only the latest 10 records.') }}
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea class="h-[50vh]">
                  <div class="min-w-full overflow-x-auto">
                    <Table class="min-w-full table-fixed">
                      <TableCaption>
                        {{ allCurrentWorkflowLogs.length > 0 ? `Found ${allCurrentWorkflowLogs.length} record(s)` : 'No records found' }}
                      </TableCaption>


                      <thead class="sticky top-0   z-10">
                        <TableRow>

                          <TableHead class="w-14"> {{ t('Channel') }}</TableHead>
                          <TableHead class="w-14">{{ t('Duration') }}</TableHead>
                          <TableHead class="w-1/3">{{ t('Logs') }}</TableHead>
                          <TableHead class="w-1/3">{{ t('Result') }}</TableHead>

                          <TableHead class="w-20">{{ t('CreatedAt') }}</TableHead>

                        </TableRow>
                      </thead>

                      <TableBody>
                        <TableRow v-for="log in allCurrentWorkflowLogs" :key="log.objectId">

                          <TableCell class="font-medium w-10">
                            {{ log.channel }}
                          </TableCell>
                          <TableCell class="font-medium  dark:text-green-300 text-[#2977f5]">
                            {{ log.times.toFixed(2) }}ms
                          </TableCell>
                          <TableCell>
                            <div class="flex flex-row items-center gap-2 ">
                              <div class="line-clamp-1 ">{{ log.logs }}</div>
                              <Button variant="destructive" size="sm" class="text-sm" @click="copyLogs(log.logs)">
                                <NuxtIcon name="lucide:copy" size="16" />
                              </Button>
                            </div>

                          </TableCell>
                          <TableCell>
                            <div class="flex flex-row items-center gap-2 ">
                              <div class="line-clamp-1 ">{{ log.result }}</div>
                              <Button variant="destructive" size="sm" class="text-sm" @click="copyResult(log.result)">
                                <NuxtIcon name="lucide:copy" size="16" />
                              </Button>
                            </div>
                          </TableCell>

                          <TableCell>{{ log.createdAt?.toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) }}</TableCell>
                        </TableRow>
                      </TableBody>

                    </Table>
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <DialogClose as-child>
                    <Button type="button" variant="secondary">
                      {{ t('Close') }}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog v-model:open="isShareDialogOpen">
              <DialogTrigger as-child>


              </DialogTrigger>
              <DialogContent v-if="currentWorkflow" class="!max-w-4xl p-5    ">
                <DialogHeader>
                  <DialogTitle> {{ t('Share this Workflow') }}</DialogTitle>
                  <DialogDescription>
                    {{ t('Anyone with the link can view this workflow.') }}
                  </DialogDescription>
                </DialogHeader>
                <div v-if="currentWorkflowShareLink" class="flex flex-row items-center justify-between gap-x-4">
                  <Input v-model="currentWorkflowShareLink" class="" readonly disabled />
                  <Button variant="outline" size="sm" class="ml-2" @click="copyShareLink">
                    <NuxtIcon name="lucide:copy" size="16" />
                    {{ t('Copy Link') }}
                  </Button>

                </div>
                <Separator class="my-2" />
                <p class="font-extrabold"> {{ t('People with access') }}({{ allWorkflowUserShares.length }})</p>

                <ScrollArea class="h-[50vh]   ">

                  <div class="min-w-full overflow-x-auto pr-6">



                    <div class="flex flex-col space-y-4 ">
                      <div v-for="(shareUser, index) in allWorkflowUserShares" :key="shareUser.objectId" class="flex flex-row items-center  justify-between">
                        <div class="flex flex-row items-center space-x-4">
                          <Avatar>
                            <AvatarImage :src="shareUser.user.avatar" :alt="shareUser.user.name" />
                            <AvatarFallback>CN {{ index + 1 }}</AvatarFallback>
                          </Avatar>
                          <div class="flex flex-col flex-1 space-y-1">
                            <div>{{ shareUser.user.name }}</div>
                            <div class="text-muted-foreground text-xs">{{ shareUser.user.email }}</div>
                          </div>
                        </div>
                        <div v-if="currentWorkflow.temp_isMine">
                          <Select v-model="shareUser.temp_operationType" placeholder="Choose" @update:modelValue="onOpTypeChange(shareUser)">
                            <SelectTrigger class="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent class=" ">
                              <SelectItem v-for="operationType in shareOperationTypes" :key="operationType.value" :value="operationType.value">
                                {{ operationType.name }}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                      </div>
                    </div>

                  </div>
                </ScrollArea>

                <DialogFooter>
                  <DialogClose as-child>
                    <Button type="button" variant="secondary">
                      {{ t('Close') }}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div v-if="showAPIDialog">
              <WorkflowApi v-model:open="showAPIDialog" />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ClientOnly>
  </div>
</template>
