<script setup lang="ts">
const colorMode = useColorMode()

/** 复选框 ↔ 深浅色双向绑定 */
const isDark = computed({
    get: () => colorMode.preference === 'dark',
    set: v => (colorMode.preference = v ? 'dark' : 'light')
})
</script>

<template>
    <!-- daisyUI 官方的 switch：label.swap -->
    <label class="swap swap-rotate cursor-pointer ">
        <!-- 👇 v-model 双向绑定；true=dark, false=light -->
        <input type="checkbox" v-model="isDark" class="sr-only" aria-label="toggle theme" />

        <!-- swap-on = 深色时显示的图标 -->
        <NuxtIcon name="i-heroicons-moon-20-solid" class="swap-on  " size="20" />

        <!-- swap-off = 浅色时显示的图标 -->
        <NuxtIcon name="i-heroicons-sun-20-solid" class="swap-off  " size="20" />
    </label>
</template>
