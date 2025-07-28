<script setup lang="ts">
definePageMeta({
  colorMode: 'light'   // 只这一页锁定 light
})


</script>

<template>
  <section data-theme="light" class="flex flex-col w-screen min-h-screen  ">
    <Header />
    <section class="w-screen h-full  ">
      <slot />
    </section>

    <div class="    flex items-center justify-center">
      <p class=" py-5 text-sm leading-5   md:order-1 md:mt-0">
        <span class="text-gray-500">© 2025 Torra Team</span>
        <span class="mx-1 text-gray-400">|</span>
        <NuxtLink to="/privacy" class="text-gray-500 hover:text-gray-700">隐私政策</NuxtLink>
        <span class="mx-1 text-gray-400">|</span>
        <NuxtLink to="/terms" class="text-gray-500 hover:text-gray-700">服务条款</NuxtLink>
      </p>
    </div>

  </section>
</template>
