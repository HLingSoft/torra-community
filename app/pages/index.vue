<script setup lang="ts">

useHead({
  title: '企业级AI智能体和工作流平台',
})




</script>

<template>


  <section class="w-srceen relative  flex flex-col ">

    <div class=" bg-no-repeat bg-cover bg-home pb-32">

      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto py-32  sm:py-48">
          <div class="hidden sm:mb-8 sm:flex sm:justify-center">
            <div class=" font-bold px-3 py-1 text-little arc-underline leading-6 ring-1 ring-white/10 hover:ring-white/20">
              可私有化部署的 AI 智能体与工作流平台
            </div>
          </div>
          <div class="text-center flex flex-col items-center">
            <h1 class=" text-balance text-5xl font-extrabold  ">
              构建企业级<span class="ml-2 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text"> AI 智能体与工作流</span>
            </h1>
            <p class="mt-12    text-pretty max-w-3xl text-lg font-medium  ">
              无需编程，通过节点拖曳快速创建由 AI 驱动的智能体、知识库与自动化工作流
            </p>
            <p class="mt-5      text-pretty max-w-3xl text-lg font-medium sm:text-xl">
              助力企业步入<span class="ml-2 font-extrabold   bg-gradient-to-r from-fuchsia-500   to-cyan-500 inline-block text-transparent bg-clip-text">AI 智能化时代</span>
            </p>
            <div class="mt-14 flex items-center justify-center gap-x-6">
              <NuxtLink to="https://github.com/HLingSoft/torra-community" target="_blank" class="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none btn px-20 text-primary-foreground hover:scale-105 transition-all duration-200">
                <NuxtIcon name="fa-brands:github" /> Github<span aria-hidden="true">&rarr;</span>
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
            <div class="mt-10">
              <div class="mockup-code ">
                <pre data-prefix="$"><code>npx create-torra-app my-app</code></pre>
              </div>


            </div>
          </div>
        </div>

        <div class="flex flex-wrap   gap-5">
          <Card class="bg-background/50  max-w-sm">
            <CardHeader>
              <p class="text-lg font-semibold">可控性</p>
            </CardHeader>
            <CardContent>
              <p class="text-sm">摆脱不透明的、难以调试的 AI 系统，转而使用可视化、可控、可解释的工作流工具。</p>
            </CardContent>

          </Card>
          <Card class="bg-background/50  max-w-sm">
            <CardHeader>
              <p class="text-lg font-semibold">透明性</p>
            </CardHeader>
            <CardContent>
              <p class="text-sm"> 拖动、放置、部署，一步到位。无需隐藏逻辑或黑箱模型，工作流流程完全透明、直观、可追踪。</p>
            </CardContent>

          </Card>
          <Card class="bg-background/50  max-w-sm">
            <CardHeader>
              <p class="text-lg font-semibold">开放性</p>
            </CardHeader>
            <CardContent>
              <p class="text-sm"> 支持单个或成群 Agent。提供可视化 Playground 进行调试，并可一键发布为 API，供其他系统灵活调用。</p>
            </CardContent>

          </Card>
          <Card class="bg-background/50  max-w-sm">
            <CardHeader>
              <p class="text-lg font-semibold">快速上线，私有可控</p>
            </CardHeader>
            <CardContent>
              <p class="text-sm">无论是云端部署还是本地私有化部署，都能兼顾效率与安全，适配你的企业 IT 要求。</p>
            </CardContent>

          </Card>
          <Card class="bg-background/50  max-w-sm">
            <CardHeader>
              <p class="text-lg font-semibold">兼容主流大模型</p>
            </CardHeader>
            <CardContent>
              <p class="text-sm">原生支持市面上主流的大语言模型，快速接入、灵活切换，适配你的业务场景。</p>
            </CardContent>

          </Card>

          <Card class="bg-background/50  max-w-sm">
            <CardHeader>
              <p class="text-lg font-semibold">完整日志系统</p>
            </CardHeader>
            <CardContent>
              <p class="text-sm">全流程记录每一步操作与响应，支持调试、追踪和审计，确保模型行为可见、可控、可回溯。</p>
            </CardContent>

          </Card>
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
