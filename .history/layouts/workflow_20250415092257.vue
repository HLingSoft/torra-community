<script lang="ts" setup>
import type User from '~/models/User'
import { useVueFlow } from '@vue-flow/core'
import Workflow from '~/models/Workflow'

const { nodes, edges } = storeToRefs(useWorkflowStore())

const { user } = storeToRefs(useUserStore())

const playWorkflow = async () => {
  workflowAV.value!.nodes = nodes.value
  workflowAV.value!.edges = edges.value
  // 给每个 node自身 添加一个属性代表已经保存了
  workflowAV.value!.nodes.forEach((node:any) => {
    node.data = {
      ...node.data,
      saved: true,
    }
  })
  // 给每个 edge 添加一个属性代表已经保存了
  workflowAV.value!.edges.forEach((edge:any) => {
    edge.data = {
      ...edge.data,
      saved: true,
    }
  })

  await workflowAV.value?.save()
 
  playgroundOpen.value = true
 
}
const workflowAV = ref<Workflow>()
onMounted(async () => {
  await until(user).toBeTruthy()
  workflowAV.value = await new LC.Query(Workflow).first()

  if (!workflowAV.value) {
    workflowAV.value = new Workflow()
    workflowAV.value.user = user.value as User
    workflowAV.value.name = 'My Workflow'
    workflowAV.value.description = 'My Workflow Description'
    workflowAV.value.nodes = nodes.value
    workflowAV.value.edges = edges.value
    await workflowAV.value.save()
  }
  else {
    nodes.value = workflowAV.value.nodes
    console.log('workflowAV.value.nodes', workflowAV.value.nodes)
    edges.value = workflowAV.value.edges
    useVueFlow().setNodes(workflowAV.value.nodes)
    useVueFlow().setEdges(workflowAV.value.edges)
    useVueFlow().fitView()
  }
})

const playgroundOpen = ref(false)
</script>

<template>
  <div class="dark">
    <ClientOnly>
      <SidebarProvider>
        <WorkflowSidebar />
        <SidebarInset>
          <header class=" flex fixed z-50 w-full top-0  bg-[#18181B] h-16 shrink-0 items-center gap-2 border-b border-[hsl(var(--border))] px-4">
            <div class="flex items-center    space-x-2">
              <SidebarTrigger class="-ml-1" />
              <Separator orientation="vertical" class="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem class="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator class="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage/>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div class="flex-shrink-0 ml-4">
              <Button variant="secondary" class="hidden md:flex" @click="playWorkflow">
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="solar:play-broken" size="18" />
                  <div>Play</div>
                </div>
              </Button>
            </div>
          </header>
          <div class="flex flex-1 flex-col  ">
            <main class=" min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <slot/>
            </main>
          </div>
          <Dialog :open="playgroundOpen " @update:open="playgroundOpen = $event">
            <DialogContent class="dark flex flex-col text-white w-full max-w-5xl text-sm h-[90vh]  ">
              <WorkflowPlayground v-if="workflowAV" :workflow="workflowAV" />
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </ClientOnly>
  </div>
</template>
