 

<template>
  <section   class="flex flex-col w-screen ">
    <Header />
    <section class="w-screen h-full  ">
      <slot />
    </section>
    <div class=" mt-20 2xl:mt-40 font-[HLFont-Heavy] flex flex-col gap-y-10 items-center justify-center py-20 w-screen bg-repeat bg-cover bg-[url(https://resource.bantouyan.com/battleyeah-ai/ai-website/public/img/home-bg.png)]">
      <div class="font-extrabold text-4xl ">
        立即体验企业级 AI 工作流的<span class="ml-2 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">无限可能</span>
      </div>
      <div class="font-semibold text-xl">
        我们与您携手共进 AI 时代
      </div>
      <NuxtLink to="/me" target="_blank" class="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none dy-btn px-20 dy-btn-primary hover:scale-105 transition-all duration-200">
        免费试用<span aria-hidden="true">&rarr;</span>
      </NuxtLink>
    </div>
    <Footer />
  </section>
</template>
