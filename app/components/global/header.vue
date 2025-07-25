<script setup lang="ts">
const { t } = useI18n()
const y = ref(0)
onMounted(() => {
    if (window) {

        const scroll = useScroll(window as any)
        //@ts-ignore
        watch(scroll.y, (val) => {
            y.value = val
            console.log('Scroll Y:', val)
        })
    }
})
</script>

<template>
    <header :class="[
        y > 10
            ? 'bg-white shadow-sm  '
            : 'bg-transparent backdrop-blur-md'
    ]" class="transition-all duration-150 fixed z-10 w-screen">
        <nav class="mx-auto max-w-7xl flex items-center justify-between py-3.5" aria-label="Global">
            <div class="flex lg:flex-1">
                <NuxtLink to="/" class="flex flex-row items-center">
                    <span class="sr-only">Torra</span>
                    <img src="~/assets/logo_1.png" class="w-auto max-h-12">
                </NuxtLink>
            </div>
            <!-- <NavigationMenu class="hidden lg:flex">
                <NavigationMenuList>
                    <NavigationMenuLink asChild>
                        <NuxtLink href="#" class="group inline-flex h-9 w-max items-center justify-center  rounded-lg bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                            产品
                        </NuxtLink>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                        <NuxtLink href="#" class="group inline-flex h-9 w-max items-center justify-center  rounded-lg bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                            VIP
                        </NuxtLink>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                        <NuxtLink href="#" class="group inline-flex h-9 w-max items-center justify-center  rounded-lg bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                            商店
                        </NuxtLink>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                        <NuxtLink href="#" class="group inline-flex h-9 w-max items-center justify-center  rounded-lg bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                            文档
                        </NuxtLink>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                        <NuxtLink href="#" class="group inline-flex h-9 w-max items-center justify-center  rounded-lg bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                            Blog
                        </NuxtLink>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                        <NuxtLink href="#" class="group inline-flex h-9 w-max items-center justify-center  rounded-lg bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                            联系我们
                        </NuxtLink>
                    </NavigationMenuLink>
                </NavigationMenuList>
            </NavigationMenu> -->


            <div class="hidden lg:flex lg:flex-1 lg:justify-end gap-x-5">



                <Button variant="ghost" class="flex items-center gap-2" as="a" href="https://github.com/HLingSoft/torra-community" target="_blank">

                    <NuxtIcon name="lucide:github" size="22" class="  text-gray-900 hover:text-gray-700 transition-colors" />
                    Github

                </Button>

                <NuxtLink to="/workflow" target="_blank" class="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none btn px-10  text-white">
                    {{ t('Try Free') }} <span aria-hidden="true">&rarr;</span>
                </NuxtLink>
            </div>
        </nav>

    </header>
</template>
