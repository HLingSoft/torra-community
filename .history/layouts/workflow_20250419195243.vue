<script lang="ts" setup>
import type User from '~/models/User'
import { useVueFlow } from '@vue-flow/core'
import Workflow,{ EnumWorkflow} from '~/models/Workflow'

const { nodes, edges ,currentWorkflow} = storeToRefs(useWorkflowStore())

const { user,currentWorkspace } = storeToRefs(useUserStore())

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
  await until(currentWorkspace).toBeTruthy()
  currentWorkflow.value = await new LC.Query(Workflow).equalTo(EnumWorkflow.USER,user.value).equalTo(EnumWorkflow.WORKSPACE,currentWorkspace.value).first()

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
  <div class="dark  ">
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
            <div class="flex-shrink-0 ml-4 flex flex-row items-center justify-between">
            <div class=" flex flex-row items-center gap-x-7">
              <Button size="sm" variant="outline" class="hidden md:flex">
                <div class="flex items-center space-x-2 text-white">
                  <NuxtIcon name="ic:round-add" size="18" />
                  <div class="">Create New Workflow</div>
                </div>
              </Button>
              <Button size="sm" variant="destructive" class="hidden md:flex" @click="playWorkflow">
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="solar:play-broken" size="18" />
                  <div>Playground</div>
                </div>
              </Button>
              <Button size="sm" variant="link" class="hidden md:flex" >
                <div class="flex items-center space-x-2">
                  <NuxtIcon name="solar:code-2-line-duotone" size="18" />
                  <div>API</div>
                </div>
              </Button>
            </div>
            <div>

              <DropdownMenu v-if="user">
                  <DropdownMenuTrigger as-child @click.stop>
                    <Button variant="secondary" size="icon" class="rounded-full">
                      <div class="dy-avatar dy-online ">
                        <div class="w-8 rounded-full ring ring-offset-2 ring-[#FFE1CC] ring-offset-base-100">
                          <img :src="user.avatar" />
                        </div>
                      </div>
                      <span class="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="w-56 space-y-2" align="end">
                    <DropdownMenuLabel class="font-normal flex">
                      <div class="flex flex-col space-y-3">
                        <Label class="text-sm font-medium leading-none">
                          {{ user.nickname }}
                        </Label>
                        <!-- <p class="text-xs leading-none text-muted-foreground">
                        {{ user.phone }}
                      </p> -->
                        <div class="text-sm line-clamp-2 max-w-40  h-10 leading-none text-muted-foreground">
                          {{ user.email }}
                        </div>
                        <div v-if="user.accountType === EnumAccountType.Enterprise" class="flex items-center gap-x-2">
                          <img src="https://ai.file.kop-consulting.com/q4VscaUnAveOBwbvWgzs0ivxB80fRGcw/crown.png" class="w-6 h-6 inline-block" />
                          <p class="text-orange-600">
                            企业用户
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator v-if="user.accountType === EnumAccountType.Personal" />
                    <DropdownMenuItem v-if="user.accountType === EnumAccountType.Personal" class="cursor-pointer" @click="toOpenPage('/vip')">
                      <NuxtIcon name="mingcute:vip-1-line" size="20" /> 升级企业版
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem class="cursor-pointer" @click="toPage('/me/profile')">
                      <NuxtIcon name="iconamoon:profile-light" size="20" /> 个人信息
                    </DropdownMenuItem>

                    <DropdownMenuItem :disabled="true" class="cursor-pointer ">
                      <NuxtIcon name="hugeicons:money-bag-01" size="20" />财务中心
                    </DropdownMenuItem>
                    <DropdownMenuItem v-if="user.isAdmin" class="cursor-pointer " @click="toOpenPage('/admin')">
                      <NuxtIcon name="weui:setting-outlined" size="20" />超管中心
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="cursor-pointer" @click="userlogOut">
                      <NuxtIcon name="ant-design:logout-outlined" size="20" />退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
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
