<script lang="ts" setup>
import type User from '~/models/User'
import { useVueFlow } from '@vue-flow/core'
import Workflow from '~/models/Workflow'

const { nodes, edges ,currentWorkflow} = storeToRefs(useWorkflowStore())

const { user } = storeToRefs(useUserStore())

const playWorkflow = async () => {
  currentWorkflow.value!.nodes = nodes.value
  currentWorkflow.value!.edges = edges.value
  // 给每个 node自身 添加一个属性代表已经保存了
  currentWorkflow.value!.nodes.forEach((node:any) => {
    node.data = {
      ..._.cloneDeep(node.data),
      saved: true,
    }
  })
  // 给每个 edge 添加一个属性代表已经保存了
  currentWorkflow.value!.edges.forEach((edge:any) => {
    edge.data = {
      ..._.cloneDeep(edge.data),
      saved: true,
    }
  })

  await currentWorkflow.value?.save()
 
  playgroundOpen.value = true
 
}

onMounted(async () => {
  await until(user).toBeTruthy()
  currentWorkflow.value = await new LC.Query(Workflow).first()

  if (!currentWorkflow.value) {
    currentWorkflow.value = new Workflow()
    currentWorkflow.value.user = user.value as User
    currentWorkflow.value.name = 'My Workflow'
    currentWorkflow.value.description = 'My Workflow Description'
    currentWorkflow.value.nodes = nodes.value
    currentWorkflow.value.edges = edges.value
    await currentWorkflow.value.save()
  }
  else {
    nodes.value = currentWorkflow.value.nodes
    // console.log('currentWorkflow.value.nodes', currentWorkflow.value.nodes)
    edges.value = currentWorkflow.value.edges
    useVueFlow().setNodes(currentWorkflow.value.nodes)
    // useVueFlow().setEdges(currentWorkflow.value.edges)
    // useVueFlow().fitView()
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
              <SidebarTrigger class="-ml-1 text-white" />
              <Separator orientation="vertical" class="mr-2 h-4  " />
              <!-- <Breadcrumb>
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
              </Breadcrumb> -->
            </div>
            <div class="flex-shrink-0 ml-4 flex flex-row items-center gap-x-5">
              <Button size="sm" variant="outline" class="hidden md:flex">
                <div class="flex items-center space-x-2 text-white">
                  <NuxtIcon name="ic:round-add" size="18" />
                  <div class="">Create New Workflow</div>
                </div>
              </Button>
              <Button size="sm" variant="destructive" class="hidden md:flex" @click="playWorkflow">
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
            <DialogContent class="dark flex flex-col text-white w-full !max-w-5xl text-sm h-[90vh]  ">
              <WorkflowPlayground v-if="currentWorkflow" :workflow="currentWorkflow" />
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </ClientOnly>
  </div>
</template>
