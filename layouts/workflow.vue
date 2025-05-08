<script lang="ts" setup>
import type User from '~/models/User'
import { useVueFlow } from '@vue-flow/core'
import Workflow, { EnumWorkflow } from '~/models/Workflow'
import UserWorkspace from '~/models/UserWorkspace'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import WorkflowHistory, { EnumWorkflowHistory } from '~/models/WorkflowHistory'
import WorkflowRunLog, { EnumWorkflowRunLog } from '~/models/WorkflowRunLog'
const { nodes, edges, currentWorkflow } = storeToRefs(useWorkflowStore())

const { user, currentWorkspace } = storeToRefs(useUserStore())
const history = useWorkflowHistoryStore()
const { copy } = useClipboard()

const playWorkflow = async () => {

  await saveWorkflow()
  playgroundOpen.value = true

}
const allWorkflows = ref<Workflow[]>([])

onMounted(async () => {
  // useToast('新建工作流成功')

  await until(user).toBeTruthy()
  await until(currentWorkspace).toBeTruthy()
  allWorkflows.value = await new LC.Query(Workflow).include(EnumWorkflow.USER).include(EnumWorkflow.WORKSPACE).equalTo(EnumWorkflow.USER, user.value).equalTo(EnumWorkflow.WORKSPACE, currentWorkspace.value).descending(EnumWorkflow.UPDATEDAT).find()
  currentWorkflow.value = allWorkflows.value.length > 0 ? allWorkflows.value[0] : undefined // await new LC.Query(Workflow).equalTo(EnumWorkflow.USER, user.value).equalTo(EnumWorkflow.WORKSPACE, currentWorkspace.value).first()

  if (!currentWorkflow.value) {
    currentWorkflow.value = new Workflow()
    currentWorkflow.value.user = user.value as User
    currentWorkflow.value.name = 'My First Workflow'
    currentWorkflow.value.description = 'My First Workflow Description'
    currentWorkflow.value.nodes = nodes.value
    currentWorkflow.value.edges = edges.value
    await currentWorkflow.value.save()
  }
  else {
    nodes.value = currentWorkflow.value.nodes

    edges.value = currentWorkflow.value.edges
    // useVueFlow().setNodes(currentWorkflow.value.nodes)

  }

  await nextTick()
  useVueFlow().fitView()

  history.snapshot('初始化') // 记录初始状态



})

const playgroundOpen = ref(false)
const userlogOut = async () => {
  console.log('userlogOut')
  const confirmed = await useConfirm({
    title: '退出登录',
    description: '确定要退出登录吗？',
  })

  if (confirmed) {
    // 执行退出逻辑
    await LC.User.logOut()
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
  currentWorkflow.value!.nodes = nodes.value
  currentWorkflow.value!.edges = edges.value

  currentWorkflow.value!.nodes.forEach((node: any) => {
    node.data = {
      ..._.cloneDeep(node.data),
      saved: true,
    }
  })
  // 给每个 edge 添加一个属性代表已经保存了
  currentWorkflow.value!.edges.forEach((edge: any) => {
    edge.data = {
      ..._.cloneDeep(edge.data),
      saved: true,
    }
  })

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
    a.download = `AskPro-${currentWorkflow.value.name}-工作流.json`
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



const isHistoryDialogOpen = ref(false)
const currentWorkflowHistories = ref<WorkflowHistory[]>([])
watch(isHistoryDialogOpen, async () => {
  if (isHistoryDialogOpen.value) {
    if (!currentWorkflow.value) {
      return
    }
    currentWorkflowHistories.value = await new LC.Query(WorkflowHistory).equalTo(EnumWorkflowHistory.WORKFLOW, currentWorkflow.value).descending(EnumWorkflow.CREATEDAT).limit(1000).find()


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
    allCurrentWorkflowLogs.value = await new LC.Query(WorkflowRunLog).include(EnumWorkflowRunLog.USER).equalTo(EnumWorkflowRunLog.WORKFLOW, currentWorkflow.value).descending(EnumWorkflowRunLog.CREATEDAT).limit(1000).find()
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
</script>

<template>
  <div class="dark  ">
    <ClientOnly>
      <SidebarProvider>
        <WorkflowSidebar />
        <SidebarInset>

          <header class=" flex fixed z-50 w-full py-5  top-0  bg-background h-16 shrink-0 items-center gap-2 border-b border-[hsl(var(--border))] px-4">
            <div class="flex items-center    space-x-2">
              <SidebarTrigger class="-ml-1 text-white" />

            </div>
            <Separator orientation="vertical" class="mr-2 h-3   " />





            <div class="w-52">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button size="sm" variant="outline" class="w-full text-white">

                    <div v-if="currentWorkflow" class="flex flex-col gap-0.5 leading-none truncate">

                      <span class="text-xs ">{{ currentWorkflow.name }}</span>
                    </div>
                    <div v-else>

                      <Skeleton class="h-2 w-32 rounded-full" />
                    </div>
                    <ChevronsUpDown class="ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-52 dark py-2" align="start">
                  <DropdownMenuItem v-for="workflow in allWorkflows" :key="workflow.objectId" class="w-full py-2   max-w-48 text-xs" @select="currentWorkflow = workflow">
                    {{ workflow.name }}
                    <Check v-if="workflow.objectId === currentWorkflow?.objectId" class="ml-auto" />
                  </DropdownMenuItem>
                  <Separator class="my-2   " />
                  <Dialog v-model:open="isCreateWorkflowDialogOpen">
                    <DialogTrigger as-child>
                      <Button size="sm" variant="outline" class="hidden md:flex">
                        <div class="flex items-center space-x-2 text-white">
                          <NuxtIcon name="ic:round-add" size="18" />
                          <div class="">Create New Workflow</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-[425px] dark text-white">
                      <DialogHeader>
                        <DialogTitle>Create New Workflow</DialogTitle>
                        <DialogDescription>
                          Create a new workflow by filling out the form below. You can add nodes and edges to your workflow after creating it.
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
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                </DropdownMenuContent>

              </DropdownMenu>

            </div>



            <div class="flex gap-x-5 ml-5">

              <Button :disabled="!currentWorkflow" size="sm" variant="outline" class="hidden md:flex " @click="saveWorkflow">
                <div class="flex items-center space-x-2 text-white">
                  <NuxtIcon name="fluent:save-20-regular" size="18" />
                  <div>Save</div>
                </div>
              </Button>




              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button :disabled="!currentWorkflow || !currentWorkflow.objectId" size="sm" variant="outline" class="hidden md:flex ">
                    <div class="flex items-center space-x-2 text-white w-32 justify-center">
                      <NuxtIcon name="icon-park-outline:more" size="18" />
                      <div>Options</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="dark space-y-1.5 py-2 w-36">

                  <DropdownMenuItem>
                    <div @click="isEditDetailsDialogOpen = true" class="flex items-center space-x-2">
                      <NuxtIcon name="mynaui:edit" size="19" />
                      <p>Edit Details</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div @click="isHistoryDialogOpen = true" class="flex items-center space-x-2 ">
                      <NuxtIcon name="solar:history-bold-duotone" size="19" />
                      <p>Histories</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div class="flex items-center space-x-2 " @click="isLogsDialogOpen = true">
                      <NuxtIcon name="material-symbols-light:logo-dev-outline-rounded" size="19" />
                      <p>Logs</p>
                    </div>
                  </DropdownMenuItem>
                  <!-- <DropdownMenuItem>
                    <div class="flex items-center space-x-2">
                      <NuxtIcon name="solar:import-line-duotone" size="19" />
                      <p>Import</p>
                    </div>
                  </DropdownMenuItem> -->
                  <DropdownMenuItem>
                    <div class="flex items-center space-x-2" @click="exportWorkflow">
                      <NuxtIcon name="solar:export-line-duotone" size="19" />
                      <p>Export</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div @click="history.undo" :class="{ ' opacity-35 cursor-not-allowed': !history.canUndo }" class="flex items-center space-x-2">

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



                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div class="flex items-center space-x-2 text-destructive cursor-pointer" @click="deleteWorkflow">
                      <NuxtIcon name="fluent:delete-24-regular" size="18" />
                      <div>Delete</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


              <Button size="sm" variant="destructive" class="hidden md:flex " @click="playWorkflow">
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="solar:play-broken" size="18" />
                  <div>Playground</div>
                </div>
              </Button>
              <Button :disabled="!currentWorkflow || !currentWorkflow.objectId" size="sm" variant="link" class="hidden md:flex   " @click="showAPIDialog = true">
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="solar:code-2-line-duotone" size="18" />
                  <div>API</div>
                </div>
              </Button>
            </div>
            <Separator orientation="vertical" class="mx-5 h-3   " />
            <Button size="sm" variant="link" class="hidden md:flex  ">
              <div class="flex items-center space-x-2">
                <NuxtIcon name="hugeicons:google-doc" size="18" />
                <div>Docs</div>
              </div>
            </Button>

          </header>
          <div class="flex fixed z-50 right-4 top-0   h-16 items-center justify-center">


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
              <DropdownMenuContent class="w-56 space-y-3 dark" align="center" side="bottom">
                <DropdownMenuLabel class="font-normal flex">
                  <div class="flex flex-col  items-center my-2">
                    <Label class="text-sm font-medium leading-none">
                      {{ user.name }}
                    </Label>



                  </div>
                </DropdownMenuLabel>

                <Separator class="w-full" />
                <DropdownMenuItem :disabled="true" class="cursor-pointer  py-2.5">
                  <NuxtIcon name="iconamoon:profile-light" size="18" /> 个人信息
                </DropdownMenuItem>



                <DropdownMenuItem :disabled="true" class="cursor-pointer  py-2.5">
                  <NuxtIcon name="hugeicons:money-bag-01" size="18" />财务中心
                </DropdownMenuItem>

                <DropdownMenuItem class="cursor-pointer py-2.5" @click="userlogOut">
                  <NuxtIcon name="ant-design:logout-outlined" size="18" />退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
          <div class="flex flex-1 flex-col  ">
            <main class=" min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <slot />
            </main>
          </div>

          <Dialog v-if="currentWorkflow" :open="playgroundOpen" @update:open="playgroundOpen = $event">

            <DialogContent class="dark   text-white w-full !max-w-7xl text-sm !h-[90vh]  grid grid-rows-[auto_1fr_auto] ">
              <DialogHeader>
                <DialogTitle>{{ currentWorkflow.name }}</DialogTitle>
                <DialogDescription>
                  {{ currentWorkflow.description }}
                </DialogDescription>
              </DialogHeader>
              <!-- <Separator /> -->

              <WorkflowPlayground :workflow="currentWorkflow" class="overflow-hidden" />


            </DialogContent>
          </Dialog>


          <Dialog v-model:open="isEditDetailsDialogOpen">
            <DialogTrigger as-child>


            </DialogTrigger>
            <DialogContent v-if="currentWorkflow" class="sm:max-w-[425px] dark text-white">
              <DialogHeader>
                <DialogTitle>Edit Current Workflow</DialogTitle>
                <DialogDescription>
                  Edit the details of the current workflow by filling out the form below.
                </DialogDescription>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="name" class="text-right">
                    Name
                  </Label>
                  <Input id="name" v-model="currentWorkflow.name" class="col-span-3 !text-sm" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="description" class="text-right">
                    Description
                  </Label>
                  <Textarea id="description" v-model="currentWorkflow.description" class="col-span-3 !text-sm" />
                </div>
              </div>
              <DialogFooter>
                <Button @click="saveCureentWorkflow">
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          <Dialog v-model:open="isHistoryDialogOpen">
            <DialogTrigger as-child>


            </DialogTrigger>
            <DialogContent v-if="currentWorkflow" class="!max-w-7xl   dark text-white">
              <DialogHeader>
                <DialogTitle>Histories</DialogTitle>
                <DialogDescription>
                  Show the histories of the current workflow.
                </DialogDescription>
              </DialogHeader>

              <ScrollArea class="h-[50vh]">
                <div class="min-w-full overflow-x-auto">
                  <Table class="min-w-full table-fixed">
                    <TableCaption>
                      {{ currentWorkflowHistories.length > 0 ? `Found ${currentWorkflowHistories.length} record(s)` : 'No records found' }}
                    </TableCaption>


                    <thead class="sticky top-0   z-10">
                      <TableRow>
                        <TableHead class="w-1/3">Version</TableHead>
                        <TableHead>CreatedAt</TableHead>
                        <TableHead class="flex items-center justify-end space-x-2">Operator</TableHead>
                      </TableRow>
                    </thead>

                    <TableBody>
                      <TableRow v-for="history in currentWorkflowHistories" :key="history.objectId">
                        <TableCell class="font-medium w-1/3">
                          {{ history.version }}
                        </TableCell>
                        <TableCell>{{ history.temp_createdAtStr }}</TableCell>
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
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          <Dialog v-model:open="isLogsDialogOpen">
            <DialogTrigger as-child>


            </DialogTrigger>
            <DialogContent v-if="currentWorkflow" class="!max-w-7xl   dark text-white">
              <DialogHeader>
                <DialogTitle>Logs</DialogTitle>
                <DialogDescription>
                  Show the logs of the current workflow.
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
                        <TableHead class="w-32">Name</TableHead>
                        <TableHead class="w-20">Channel</TableHead>
                        <TableHead class="w-20">Times</TableHead>
                        <TableHead class="w-1/4">Logs</TableHead>
                        <TableHead class="w-1/4">Result</TableHead>
                        <TableHead class="w-20">CreatedAt</TableHead>
                        <!-- <TableHead class="flex items-center justify-end space-x-2">Operator</TableHead> -->
                      </TableRow>
                    </thead>

                    <TableBody>
                      <TableRow v-for="log in allCurrentWorkflowLogs" :key="log.objectId">
                        <TableCell class="font-medium w-32 ">
                          <div class="line-clamp-1">
                            {{ log.name }}
                          </div>
                        </TableCell>
                        <TableCell class="font-medium w-20">
                          {{ log.channel }}
                        </TableCell>
                        <TableCell class="font-medium w-20 ">
                          {{ log.times }}
                        </TableCell>
                        <TableCell>
                          <div class="flex flex-row items-center gap-2">
                            <div class="line-clamp-1 ">{{ log.logs }}</div>
                            <Button variant="destructive" size="sm" class="text-sm" @click="copyLogs(log.logs)">
                              <NuxtIcon name="lucide:copy" size="16" />
                            </Button>
                          </div>

                        </TableCell>
                        <TableCell>
                          <div class="flex flex-row items-center gap-2">
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
                    Close
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

    </ClientOnly>
  </div>
</template>
