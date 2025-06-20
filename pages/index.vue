<script setup lang="ts">

useHead({
  title: '企业级AI智能体和工作流平台',
})




</script>

<template>


  <section class="w-srceen relative  flex flex-col ">

    <div class=" bg-no-repeat bg-cover bg-home pb-32">
      <div class=" ">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto py-32  sm:py-48">
            <div class="hidden sm:mb-8 sm:flex sm:justify-center">
              <div class=" font-bold px-3 py-1 text-little arc-underline leading-6 ring-1 ring-white/10 hover:ring-white/20">
                借助 AI 提升工作效率，为企业降低成本
              </div>
            </div>
            <div class="text-center flex flex-col items-center">
              <h1 class=" text-balance text-5xl font-extrabold  ">
                构建企业级<span class="ml-2 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text"> AI 智能体与工作流</span>
              </h1>
              <p class="mt-12    text-pretty max-w-3xl text-lg font-medium  ">
                无需编程，通过大白话快速创建由 AI 驱动的智能体、知识库与自动化工作流
              </p>
              <p class="mt-5      text-pretty max-w-3xl text-lg font-medium sm:text-xl">
                助力企业步入<span class="ml-2 font-extrabold   bg-gradient-to-r from-fuchsia-500   to-cyan-500 inline-block text-transparent bg-clip-text">AI 智能化时代</span>
              </p>
              <div class="mt-14 flex items-center justify-center gap-x-6">
                <NuxtLink to="/workflow" target="_blank" class="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none btn px-20 text-primary-foreground hover:scale-105 transition-all duration-200">
                  免费试用<span aria-hidden="true">&rarr;</span>
                </NuxtLink>
                <div class="dropdown dropdown-hover">
                  <div tabindex="0" role="button" class="btn  hover:scale-105 transition-all duration-200 btn-outline px-10 m-1">
                    加入 AI 讨论群
                  </div>
                  <ul tabindex="0" class="dropdown-content   rounded-lg z-[1000] bg-white   p-0.5 ">
                    <div class=" flex flex-row gap-x-4 ">
                      <div class="drop-shadow-md flex flex-col p-2">
                        <img class="w-40 h-40  rounded-lg" src="https://file.web.hlingsoft.com/1GIiiRvyyhQBMoFFiRL4GqaqaNqlvvDO/20241023-152905.jpeg">
                        <p class="mt-2 opacity-80  text-sm">
                          微信扫一扫
                        </p>
                      </div>

                    </div>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>


  </section>


</template>

<style scoped>
.bg-home {
  @apply bg-cover bg-center;
  background-image: url('@/assets/home-bg.png');
}
</style>
