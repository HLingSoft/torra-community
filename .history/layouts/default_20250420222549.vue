 <script setup lang="ts">

const navigation = {
  solutions: [
    { name: '提示词', href: '#' },
    { name: 'FileTalk', href: '#' },
    { name: '知识库', href: '#' },
    { name: 'AI工作流', href: '#' },
    { name: '行业方案', href: '#' },
  ],
  support: [
    { name: '文档', href: '#' },
    { name: '论坛', href: '#' },
    { name: '博客', href: '#' },
    { name: '更新日志', href: '#' },
  ],
  company: [
    { name: '企业介绍', href: '#' },
    { name: '抖音', href: '#' },
    { name: '视频号', href: '#' },
    { name: '公众号', href: '#' },
    { name: '小红书', href: '#' },
  ],

}
 </script>

<template>
  <section   class="flex flex-col w-screen ">
   
    <section class="w-screen h-full  ">
      <slot />
    </section>
    <div class=" mt-20 2xl:mt-40  flex flex-col gap-y-10 items-center justify-center py-20 w-screen bg-repeat bg-cover bg-[url(https://resource.bantouyan.com/battleyeah-ai/ai-website/public/img/home-bg.png)]">
      <div class="font-extrabold text-4xl ">
        立即体验企业级 AI 工作流的<span class="ml-2 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">无限可能</span>
      </div>
      <div class="font-semibold text-xl">
        我们与您携手共进 AI 时代
      </div>
      <NuxtLink to="/workflow" target="_blank" class="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none btn px-20 btn-primary hover:scale-105 transition-all duration-200">
        免费试用<span aria-hidden="true">&rarr;</span>
      </NuxtLink>
    </div>
    <footer class="bg-black  " aria-labelledby="footer-heading">
    <h2 id="footer-heading" class="sr-only">
      Footer
    </h2>
    <div class="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-20 lg:px-8  ">
      <div class="xl:grid xl:grid-cols-3 xl:gap-8">
        <img class="w-auto max-h-14" src="~/assets/logo_white.png" alt="Company name" >
        <div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
          <div class="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 class="     leading-6 text-white">
                解决方案
              </h3>
              <ul role="list" class="mt-6 space-y-4">
                <li v-for="item in navigation.solutions" :key="item.name">
                  <a :href="item.href" class="text-sm leading-6 text-white/80 hover:text-white">{{ item.name }}</a>
                </li>
              </ul>
            </div>
            <div class="mt-10 md:mt-0">
              <h3 class="     leading-6 text-white">
                技术支持
              </h3>
              <ul role="list" class="mt-6 space-y-4">
                <li v-for="item in navigation.support" :key="item.name">
                  <a :href="item.href" class="text-sm leading-6 text-white/80 hover:text-white">{{ item.name }}</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 class="   leading-6 text-white">
                关于我们
              </h3>
              <ul role="list" class="mt-6 space-y-4">
                <li v-for="item in navigation.company" :key="item.name">
                  <a :href="item.href" class="text-sm leading-6 text-white/80 hover:text-white">{{ item.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
        <p class="mt-8 text-sm leading-5 text-white/80 md:order-1 md:mt-0">
          2025 Copyright@ HLingSoft (Shanghai) Co., Ltd.<a href="https://beian.miit.gov.cn" target="_blank" class=" ml-10">沪ICP备2021004837号</a>
        </p>
      </div>
    </div>
  </footer>
  </section>
</template>
