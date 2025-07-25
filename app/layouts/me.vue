<script setup lang="ts">

const { t } = useI18n()
useHead({
    title: `Torra - ${t('dashboard')}`,


})

const { user } = storeToRefs(useUserStore())
const { getUser } = useUserStore()
const route = useRoute()

onMounted(async () => {
    if (!user.value) {
        await getUser()
    }
})
const isActive = (path: string) => (route.path === path || route.path.startsWith(path + '/'))
const toHome = () => {

    window.location.href = '/'
}
</script>


<template>

    <SidebarProvider>
        <Sidebar>

            <header @click="toHome" class="flex h-14 shrink-0 items-center gap-2 border-b px-4 cursor-pointer">
                <div class="flex bg-white aspect-square size-7 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <img src="~/assets/logo.png" class="w-auto max-h-10">

                </div>
                <div class="flex flex-col gap-0.5 leading-none font-extrabold">

                    Torra
                </div>

            </header>

            <SidebarContent>


                <div class="px-4 py-5">
                    <SidebarMenu class="flex flex-col gap-3 text-sm">
                        <SidebarMenuItem>
                            <SidebarMenuButton as-child class="hover:text-primary">
                                <NuxtLink to="/me/profile" class="flex flex-row items-center gap-2 " :class="{ 'text-primary font-extrabold': isActive('/me/profile') }">
                                    <NuxtIcon name="iconamoon:profile" size="18" />
                                    <!-- <p class="">个人信息</p> -->
                                    <p>{{ $t('profile') }}</p>
                                </NuxtLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton as-child class="hover:text-primary">
                                <NuxtLink to="/me/globalVariable" class="flex flex-row items-center gap-2 " :class="{ 'text-primary font-extrabold': isActive('/me/globalVariable') }">
                                    <NuxtIcon name="solar:global-line-duotone" size="18" />
                                    <p>{{ $t('globalVariable') }}</p>
                                </NuxtLink>

                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>

                            <SidebarMenuButton as-child class="hover:text-primary">

                                <NuxtLink to="/me/workflow" class="flex flex-row hover:text-primary items-center gap-2  " :class="{ 'text-primary font-extrabold': isActive('/me/workflow') }">
                                    <NuxtIcon name="streamline-freehand:business-workflow-merge-1" size="18" />

                                    <p>{{ $t('workflow') }}</p>
                                </NuxtLink>

                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton as-child class="hover:text-primary">
                                <NuxtLink to="/me/finance" class="flex flex-row items-center gap-2 " :class="{ 'text-primary font-extrabold': isActive('/me/finance') }">
                                    <NuxtIcon name="material-symbols-light:finance" size="18" />

                                    <p>{{ $t('finance') }}</p>
                                </NuxtLink>


                            </SidebarMenuButton>

                        </SidebarMenuItem>
                        <!-- <SidebarMenuItem>
                            <SidebarMenuButton class="opacity-35 cursor-not-allowed" as-child>
                                <div class="flex flex-row items-center gap-2 ">
                                    <NuxtIcon name="fluent:bot-48-regular" size="18" />
                                    <a href="#" class="">智能体</a>
                                </div>

                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton class="opacity-35 cursor-not-allowed" as-child>
                                <div class="flex flex-row items-center gap-2 ">
                                    <NuxtIcon name="solar:book-line-duotone" size="18" />
                                    <a href="#" class="">知识库</a>
                                </div>

                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton class="opacity-35 cursor-not-allowed" as-child>
                                <div class="flex flex-row items-center gap-2 ">
                                    <NuxtIcon name="pepicons-print:database" size="18" />
                                    <a href="#" class="">数据库</a>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton class="opacity-35 cursor-not-allowed" as-child>
                                <div class="flex flex-row items-center gap-2 ">
                                    <NuxtIcon name="solar:document-line-duotone" size="18" />
                                    <a href="#" class="">文档</a>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton class="opacity-35 cursor-not-allowed" as-child>
                                <div class="flex flex-row items-center gap-2 ">
                                    <NuxtIcon name="clarity:store-line" size="18" />
                                    <a href="#" class="">商店</a>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>

                            <SidebarMenuButton class="opacity-35 cursor-not-allowed" as-child>
                                <div class="flex flex-row items-center gap-2 ">
                                    <NuxtIcon name="ri:blogger-line" size="18" />
                                    <a href="#" class="">博客</a>
                                </div>
                            </SidebarMenuButton>

                        </SidebarMenuItem> -->

                        <SidebarMenuItem>

                            <SidebarMenuButton as-child>

                                <NuxtLink to="/me/appearance" class="flex flex-row items-center gap-2 " :class="{ 'text-primary font-extrabold': isActive('/me/appearance') }">
                                    <NuxtIcon name="ooui:appearance" size="18" />
                                    <p>{{ $t('appearance') }}</p>
                                </NuxtLink>



                            </SidebarMenuButton>

                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
        <SidebarInset class="h-screen w-fit flex-1 overflow-hidden">
            <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger class="-ml-1 " />

            </header>

            <div class="flex flex-1 flex-col gap-4 p-4 min-h-0 overflow-y-auto overflow-hidden">


                <NuxtPage />

            </div>
        </SidebarInset>
    </SidebarProvider>

</template>
