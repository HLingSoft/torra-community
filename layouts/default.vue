<script setup lang="ts">

</script>

<template>
  <section class="flex flex-col w-screen ">
    <Header />
    <main>
      <slot />
    </main>

    <footer aria-labelledby="footer-heading">
      <h2 id="footer-heading" class="sr-only">
        Footer
      </h2>
      <div class="mx-auto max-w-7xl p-6     flex flex-row items-center justify-between ">

        <p class="text-sm"> 2025 Copyright@ Torra Cloud Co., Ltd. All rights reserved.</p>
        <NuxtLink to="https://www.baidu.com" target="_blank" class="flex items-center">
          <NuxtIcon name="fa-brands:github" class="w-8 h-8 inline-block" />
          <span class="ml-2 text-sm">Powered by Torra Cloud</span>
        </NuxtLink>

      </div>
    </footer>
  </section>
</template>
