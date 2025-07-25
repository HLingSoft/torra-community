<script setup lang="ts">

definePageMeta({
    layout: 'me',
    title: '设置',
})
const { user } = storeToRefs(useUserStore())



/* 1️⃣  Nuxt 内置：深/浅/系统三态 */
const colorMode = useColorMode()
/* 默认值：把 'system' 映射成实际主题 */
const theme = ref<'light' | 'dark'>(
    colorMode.preference === 'system'
        ? (colorMode.value as 'light' | 'dark')
        : (colorMode.preference as 'light' | 'dark')
)

/* 单选框变化 → 立即写回 preference */
watch(theme, v => { colorMode.preference = v })
</script>

<template>
    <div v-if="user" class="flex flex-col items-start space-y-2 p-6 w-full max-w-3xl">
        <div class="">
            <h3 class="text-lg font-medium">
                Appearance
            </h3>
            <p class="text-sm text-muted-foreground">
                Customize the appearance of the app. Automatically switch between day and night themes.
            </p>
        </div>
        <Separator class="mb-4" />
        <div class="mt-6 flex flex-col gap-8 w-full">
            <div class="grid w-full max-w-sm items-center gap-5">
                <Label>Lanuage
                </Label>
                <div class="w-40 flex items-center justify-start">
                    <LanguageSwitch />
                </div>


            </div>


            <FormField v-slot="{ componentField }" type="radio" name="theme">
                <FormItem class="space-y-1">
                    <FormLabel>Theme</FormLabel>
                    <FormDescription>
                        Select the theme for the dashboard.
                    </FormDescription>
                    <FormMessage />

                    <RadioGroup v-model="theme" :default-value="theme" class="grid max-w-lg  grid-cols-2 gap-8 pt-2" v-bind="componentField">
                        <FormItem>
                            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                                <FormControl>
                                    <RadioGroupItem value="light" class="sr-only" />
                                </FormControl>
                                <div class="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                                    <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                        <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                            <div class="h-2 w-20 rounded-lg bg-[#ecedef]" />
                                            <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                    </div>
                                </div>
                                <div class="block w-full p-2 text-center font-normal">
                                    Light
                                </div>
                            </FormLabel>
                        </FormItem>
                        <FormItem>
                            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
                                <FormControl>
                                    <RadioGroupItem value="dark" class="sr-only" />
                                </FormControl>
                                <div class="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                                    <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                                        <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div class="h-2 w-20 rounded-lg bg-slate-400" />
                                            <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div class="h-4 w-4 rounded-full bg-slate-400" />
                                            <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div class="h-4 w-4 rounded-full bg-slate-400" />
                                            <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <span class="block w-full p-2 text-center font-normal">
                                    Dark
                                </span>
                            </FormLabel>
                        </FormItem>
                    </RadioGroup>
                </FormItem>
            </FormField>
        </div>
        <!-- <Separator class="my-5" /> -->
        <!-- <div class="flex w-full max-w-sm items-center  space-x-2">
            <Button @click="update">Update preference</Button>

        </div> -->

    </div>
</template>
