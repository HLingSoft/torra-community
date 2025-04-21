<script setup lang="ts">
 
useHead({
  title: '企业级AI智能体和工作流平台',
})
const currentTabIndex = ref(0)
interface Data {
  name: string
  image: string
  list: {
    icon: string
    title: string
    desc: string
  }[]
}
const customer = ref<Data>({
  name: '智能客服',
  image: 'https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/intelligent-scene-01.png',
  list: [

    {
      icon: 'ant-design:message-outlined',
      title: '全自动 7*24h AI客服',
      desc: '自研的强意图识别，多 Agent 架构。拟人化回复。能解决 98% 的问题。',
    },
    {
      icon: 'solar:global-bold',
      title: '不限语言，支持多渠道',
      desc: '支持全球任意语言，支持接入API 接入、公众号、微信、QQ、钉钉、飞书、企业微信、邮箱、网站等多渠道。',
    },
    {
      icon: 'carbon:chart-line-data',
      title: '强 AI 数据统计',
      desc: '支持对话记录、用户画像、用户行为、用户满意度、问题分类、问题解决率等数据统计。',
    },
    {
      icon: 'carbon:application-web',
      title: 'AI 客服应用',
      desc: '电商客服、通用网站售前咨询、产品文档介绍机器人、售后技术解答机器人、企业内部知识库机器人等。',
    },
  ],
})

const marketing = ref<Data>({
  name: '智能营销',
  image: 'https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/intelligent-scene-02.png',
  list: [

    {
      icon: 'arcticons:marketwatch',
      title: '市场洞察',
      desc: '基于同行的市场报告、数据统计，分析同行业竞品的优劣势，为企业提供市场洞察。',
    },
    {
      icon: 'tabler:ad',
      title: '营销广告投放',
      desc: '通过产品检索关键词，分析广告投放效果，为企业提供广告投放策略。',
    },
    {
      icon: 'tabler:social',
      title: '营销内容创新',
      desc: '依据产品自身用户画像，多格式内容的生产。个性化的生成营销内容。',
    },
    {
      icon: 'carbon:application-web',
      title: '工具库',
      desc: '通过内置的工具库，发掘、组合，生成营销方案。',
    },
  ],
})

const partner = ref<Data>({
  name: '智能陪练',
  image: 'https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/intelligent-scene-03.png',
  list: [

    {
      icon: 'oui:training',
      title: 'AI培训赋能',
      desc: '通过小程序、网站等渠道，随时随地学习、考核，发现问题重点辅导，提升新人销售上手效率、降低管理成本。',
    },
    {
      icon: 'material-symbols:nest-true-radiant',
      title: '贴合真实业务AI陪练',
      desc: '基于客户会话信息，快速搭建AI客户，结合业务真实演练，AI点评改善，加速提升销售实战能力。',
    },
    {
      icon: 'grommet-icons:user-expert',
      title: 'AI复制专家销售能力',
      desc: '更专业客户答疑，全面商机需求识别、快速匹配跟进客户优先级和方案，不同场景生成专家级沟通话术，增强销售转化能力。',
    },
    {
      icon: 'ic:baseline-admin-panel-settings',
      title: 'AI销售管理',
      desc: '分析销售过程，数字化复盘，定位高频问题，自动沉淀QA话术、构建企业专有知识库。',
    },
  ],
})

const data = ref<Data>()
watch(currentTabIndex, () => {
  if (currentTabIndex.value === 0) {
    data.value = customer.value
  }
  if (currentTabIndex.value === 1) {
    data.value = marketing.value
  }
  if (currentTabIndex.value === 2) {
    data.value = partner.value
  }
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <section>
    <header :class="[centerOrLeft === 'center' ? y > 10 ? 'bg-white ' : 'bg-transparent bg-none' : 'bg-white shadow-sm border-b-[1px]']" class="transition-all duration-150 fixed z-10 w-screen">
    <nav :class="[centerOrLeft === 'left' ? 'px-5 lg:px-10' : 'mx-auto max-w-7xl ']" class=" flex  items-center justify-between py-3.5  " aria-label="Global">
      <div class="flex lg:flex-1">
        <NuxtLink to="/" class=" flex flex-row items-center ">
          <span class="sr-only">AskPro</span>
          <img v-if="centerOrLeft === 'left'" src="~/assets/logo_2.png" class="w-auto max-h-12">
          <img v-if="centerOrLeft === 'center'" src="~/assets/logo_1.png" class="w-auto max-h-12">
          <p v-if="centerOrLeft === 'left'" class="font-extrabold ml-6 font-[HLFont-Heavy] text-lg">
            AI 应用商店
          </p>
        </NuxtLink>
      </div>
      <!-- <div class="flex lg:hidden">
        <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = true">
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div> -->
      <PopoverGroup class="hidden lg:flex lg:gap-x-12 ">
        <Popover class="relative">
          <PopoverButton class="flex focus:outline-none focus:ring-0 items-center gap-x-1 text-little leading-6 ">
            <span :class="{ ' font-extrabold  arc-underline': currentRouteName === 'product' }">产品模块</span>
            <ChevronDownIcon class="h-5 w-5 flex-none " aria-hidden="true" />
          </PopoverButton>

          <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
            <PopoverPanel class="absolute -left-60 top-full z-10 mt-3 w-screen max-w-4xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
              <div class="p-4 grid grid-cols-2">
                <div v-for="item in products" :key="item.name" class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
                  <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <!-- <component :is="item.icon" class="h-6 w-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" /> -->
                    <NuxtIcon :name="item.icon" class="h-6 w-6 text-gray-600 group-hover:text-primary" aria-hidden="true" />
                  </div>
                  <NuxtLink target="_blank" :to="item.href" class="flex-auto">
                    <div class="block font-semibold   ">
                      {{ item.name }}
                      <span class="absolute inset-0" />
                    </div>
                    <p class="mt-1.5 opacity-60 text-sm">
                      {{ item.description }}
                    </p>
                  </NuxtLink>
                </div>
              </div>
              <div class="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                <a v-for="item in callsToAction" :key="item.name" :href="item.href" class="flex items-center justify-center gap-x-2.5 p-3 text-sm leading-6  hover:bg-gray-100">
                  <component :is="item.icon" class="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                  {{ item.name }}
                </a>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
        <Popover class="relative">
          <PopoverButton class="flex focus:outline-none focus:ring-0 items-center gap-x-1 text-little leading-6 ">
            <span :class="{ ' font-extrabold  arc-underline': currentRouteName === 'solution' }">软件方案</span>
            <ChevronDownIcon class="h-5 w-5 flex-none " aria-hidden="true" />
          </PopoverButton>

          <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
            <PopoverPanel class="absolute -left-60 top-full z-10 mt-3 w-screen max-w-4xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
              <div class="p-4 grid grid-cols-2">
                <div v-for="item in solutions" :key="item.name" class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
                  <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <NuxtIcon :name="item.icon" class="h-6 w-6 text-gray-600 group-hover:text-primary" aria-hidden="true" />
                    <!-- <component :is="item.icon" class="h-6 w-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" /> -->
                  </div>
                  <NuxtLink target="_blank" :to="item.href" class="flex-auto">
                    <div class="block  font-semibold ">
                      {{ item.name }}
                      <span class="absolute inset-0" />
                    </div>
                    <p class="mt-1.5  opacity-60 text-sm">
                      {{ item.description }}
                    </p>
                  </NuxtLink>
                </div>
              </div>
              <!-- <div class="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                <a v-for="item in callsToAction" :key="item.name" :href="item.href" class="flex items-center justify-center gap-x-2.5 p-3 text-sm leading-6  hover:bg-gray-100">
                  <component :is="item.icon" class="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                  {{ item.name }}
                </a>
              </div> -->
            </PopoverPanel>
          </transition>
        </Popover>
        <NuxtLink to="/hardware" class="text-little leading-6  cursor-pointer">
          <span :class="{ ' font-extrabold  arc-underline': currentRouteName === 'hardware' }">智能硬件</span>
        </NuxtLink>
        <NuxtLink to="/store" class="text-little leading-6  cursor-pointer">
          <span :class="{ ' font-extrabold  arc-underline': currentRouteName === 'store' }">应用广场</span>
        </NuxtLink>
        <NuxtLink class="text-little leading-6  cursor-pointer">
          VIP服务
        </NuxtLink>

        <Popover class="relative">
          <PopoverButton class="flex focus:outline-none focus:ring-0 items-center gap-x-1 text-sm leading-6 ">
            帮助中心
            <ChevronDownIcon class="h-5 w-5 flex-none" aria-hidden="true" />
          </PopoverButton>

          <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
            <PopoverPanel class="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
              <div class="p-4">
                <div v-for="item in helpCenter" :key="item.name" class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
                  <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <component :is="item.icon" class="h-6 w-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" />
                  </div>
                  <div class="flex-auto">
                    <a :href="item.href" class="block ">
                      {{ item.name }}
                      <span class="absolute inset-0" />
                    </a>
                    <p class="mt-1 text-gray-600">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
        <!-- <a href="#" class="text-sm leading-6 ">Marketplace</a>
        <a href="#" class="text-sm leading-6 ">Company</a> -->
        <NuxtLink class="text-little leading-6  cursor-pointer">
          关于我们
        </NuxtLink>
      </PopoverGroup>

      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <NuxtLink to="/me" target="_blank" class="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none dy-btn px-10 dy-btn-primary">
          免费试用<span aria-hidden="true">&rarr;</span>
        </NuxtLink>
      </div>
    </nav>
    <!-- <Dialog class="lg:hidden" :open="mobileMenuOpen" @close="mobileMenuOpen = false">
      <div class="fixed inset-0 z-10" />
      <DialogPanel class="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div class="flex items-center justify-between">
          <a href="#" class="-m-1.5 p-1.5">
            <span class="sr-only">Your Company</span>
            <img class="h-8 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" alt="" />
          </a>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = false">
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6">
              <Disclosure v-slot="{ open }" as="div" class="-mx-3">
                <DisclosureButton class="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base leading-7  hover:bg-gray-50">
                  Product
                  <ChevronDownIcon class="h-5 w-5 flex-none" :class="[open ? 'rotate-180' : '']" aria-hidden="true" />
                </DisclosureButton>
                <DisclosurePanel class="mt-2 space-y-2">
                  <DisclosureButton v-for="item in [...products, ...callsToAction]" :key="item.name" as="a" :href="item.href" class="block rounded-lg py-2 pl-6 pr-3 text-sm leading-7  hover:bg-gray-50">
                    {{ item.name }}
                  </DisclosureButton>
                </DisclosurePanel>
              </Disclosure>
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base leading-7  hover:bg-gray-50">Features</a>
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base leading-7  hover:bg-gray-50">Marketplace</a>
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base leading-7  hover:bg-gray-50">Company</a>
            </div>
            <div class="py-6">
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2.5 text-base leading-7  hover:bg-gray-50">Log in</a>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog> -->
  </header>
  <section id="main_container" class="w-srceen relative min-h-screen  flex flex-col ">
   
   <div class=" bg-no-repeat bg-cover bg-[url(https://resource.bantouyan.com/battleyeah-ai/ai-website/public/img/home-bg.png)] pb-32">
     <div class="  pt-14 ">
       <div class="mx-auto max-w-7xl px-6 lg:px-8">
         <div class="mx-auto py-32 sm:py-48 ">
           <div class="hidden sm:mb-8 sm:flex sm:justify-center">
             <div class=" font-bold px-3 py-1 text-little leading-6 ring-1 ring-white/10 hover:ring-white/20">
               借助 AI 提升工作效率，为企业降低成本
             </div>
           </div>
           <div class="text-center flex flex-col items-center">
             <h1 class="font-[HLFont-Heavy] text-balance text-5xl font-extrabold  sm:text-6xl">
               构建企业级<span class="ml-2 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text"> AI 智能体与工作流</span>
             </h1>
             <p class="mt-12    text-pretty max-w-3xl text-lg font-medium sm:text-xl">
               无需编程，通过大白话快速创建由 AI 驱动的智能体、知识库与自动化工作流
             </p>
             <p class="mt-5      text-pretty max-w-3xl text-lg font-medium sm:text-xl">
               助力企业步入<span class="ml-2 font-extrabold   bg-gradient-to-r from-fuchsia-500   to-cyan-500 inline-block text-transparent bg-clip-text">AI 智能化时代</span>
             </p>
             <div class="mt-14 flex items-center justify-center gap-x-6">
               <NuxtLink to="/me" target="_blank" class="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none btn px-20 text-primary-foreground hover:scale-105 transition-all duration-200">
                 免费试用<span aria-hidden="true">&rarr;</span>
               </NuxtLink>
               <div class="dropdown dropdown-hover">
                 <div tabindex="0" role="button" class="btn  hover:scale-105 transition-all duration-200 btn-outline px-10 m-1">
                   加入 AI 讨论群
                 </div>
                 <ul tabindex="0" class="dropdown-content  rounded-md z-[1000] bg-white   p-0.5 ">
                   <div class=" flex flex-row gap-x-4 ">
                     <div class="drop-shadow-md flex flex-col p-2">
                       <img class="w-40 h-40 rounded-md" src="https://file.web.hlingsoft.com/1GIiiRvyyhQBMoFFiRL4GqaqaNqlvvDO/20241023-152905.jpeg">
                       <p class="mt-2 opacity-80  text-sm">
                         微信扫一扫
                       </p>
                     </div>

                   </div>
                 </ul>
               </div>
             </div>
             <p class="mt-8  font-[HLFont-Normal] text-pretty max-w-2xl text-sm opacity-80">
               立即注册享受 <span class="font-extrabold text-fuchsia-500">1000000</span> Token 优惠，每邀请一位好友注册，您和好友都将获得 <span class="font-extrabold text-fuchsia-500">100000</span> Token 奖励。全平台功能限时免费使用。
             </p>
           </div>
         </div>
       </div>

     </div>
   </div>
   <div>
     <div class="w-screen flex flex-col items-center justify-center -mt-40">
       <div class="container flex justify-center">
         <div class="bg-white relative rounded-xl w-full max-w-7xl h-[700px] shadow-xl  ">
           <div class="absolute  z-[1] -mt-10 w-full flex items-center justify-center">
             <div class="bg-gradient-to-r  from-violet-400  to-fuchsia-500   p-1 rounded-lg shadow-md">
               <div role="tablist" class=" tabs     tabs-boxed  tabs-lg">
                 <a role="tab" :class="{ 'bg-white  text-fuchsia-500 font-extrabold ': currentTabIndex === 0 }" class=" tab  text-base     px-10" @click="currentTabIndex = 0">
                   <NuxtIcon name="hugeicons:customer-service" class="mr-2" />智能客服
                 </a>
                 <a role="tab" :class="{ 'bg-white  text-fuchsia-500 font-extrabold ': currentTabIndex === 1 }" class=" tab   text-base   px-10" @click="currentTabIndex = 1">
                   <NuxtIcon name="logos:google-marketing-platform" class="mr-2" />智能营销
                 </a>
                 <a role="tab" :class="{ 'bg-white  text-fuchsia-500 font-extrabold ': currentTabIndex === 2 }" class=" tab   text-base   px-10" @click="currentTabIndex = 2">
                   <NuxtIcon name="carbon:partnership" class="mr-2" /> 智能陪练
                 </a>
                 <a role="tab" :class="{ 'bg-white  text-fuchsia-500 font-extrabold ': currentTabIndex === 3 }" class=" tab   text-base   px-10" @click="currentTabIndex = 3">
                   <NuxtIcon name="arcticons:questionnaire-star" class="mr-2" />智能问卷
                 </a>
               </div>
             </div>
           </div>
           <!-- container -->
           <div class="mt-6 py-20 px-20 ">
             <div v-if="data" class="flex flex-row h-full    ">
               <div class="  max-w-xl">
                 <p class="text-2xl mb-10 font-[HLFont-Heavy] ">
                   {{ data.name }}
                 </p>
                 <div v-for="(item, index) in data.list" :key="index" class="flex flex-row  max-w-lg my-10">
                   <div class="w-8 ">
                     <NuxtIcon :name="item.icon" class="text-fuchsia-500 mt-0.5  " size="18" />
                   </div>
                   <div class="flex flex-col   max-w-sm">
                     <p class="font-extrabold ">
                       {{ item.title }}
                     </p>
                     <p class="mt-4 opacity-80 text-sm">
                       {{ item.desc }}
                     </p>
                   </div>
                 </div>
               </div>
               <div class="max-w-2xl h-full pl-10">
                 <img :src="data.image">
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
   <!-- <div class="flex flex-col items-center  my-20 2xl:my-40">
     <div class="font-[HLFont-Heavy] text-4xl">
       合作单位
     </div>
     <Vue3Marquee class="  mt-10">
       <img height="200" width="200" class="mx-10" src="https://file.web.hlingsoft.com/3FwYjBJGRtDwbAudGaePlnXxLCNPgIHB/starbucks.svg">
       <img height="200" width="200" class="mx-10" src="https://file.web.hlingsoft.com/5ioia55N6UysncMofiEb8OSKfU1Eg684/alibaba-logo%40logotyp.us.svg">
       <img height="200" width="200" class="mx-10" src="https://file.web.hlingsoft.com/lpLFkk7RGdhs1gW1Q9HnI5Swr4j9kRWS/VectorWiki-gMiAx__china-telecom-logo.svg">
       <img height="200" width="200" class="mx-10" src="https://file.web.hlingsoft.com/5nAL28bhC3v7i5w1vSydAaRyaHenwumi/pwc-logo%40logotyp.us.svg">
       <img height="200" width="200" class="mx-10" src="https://file.web.hlingsoft.com/CB0gJjkrsz6UgAyVk4PgmASiAanWeBFd/catl-logo%40logotyp.us.svg">
       <img height="200" width="200" class="mx-10" src="https://file.web.hlingsoft.com/xXg7bsHRNGe2nYVC756vDlfmF9BFwakc/haier.svg">
       <img height="200" width="200" class="mx-10" src="https://file.web.hlingsoft.com/JkvStq65oLUHvo4S0yPYy6PH29txFBTu/anta-logo%40logotyp.us.svg">
     </Vue3Marquee>
   </div> -->
   <div class="my-20">
     <div class=" flex flex-col items-center justify-center">
       <div class="container  max-w-7xl flex flex-col items-center justify-center">
         <p class="font-[HLFont-Heavy] text-4xl font-extrabold">
           一站式<span class="text-5xl ml-2 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">解决方案</span>
         </p>
         <div class="mt-10 rounded-2xl    bg-gradient-to-br from-fuchsia-50/50 to-pink-50/50 w-full   flex flex-col items-center justify-center py-10">
           <p class="text-3xl font-extrabold">
             AI 工作流
           </p>
           <div class="text-lg mt-4">
             零代码搭建工作流，帮助你高效完成工作
           </div>
           <div class="w-full p-10 mt-10">
             <img class="w-full hover:scale-105 transition-all duration-300" src="https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/home_flow.png">
           </div>
           <!-- <img src="https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/home_agent_temporary_v3.png" /> -->
         </div>
         <div class="mt-10 w-full flex flex-row gap-x-10">
           <div class="rounded-2xl    bg-gradient-to-br from-[#effcff] to-[#effcff]/50 w-full    flex flex-col items-center justify-center py-20 px-5">
             <p class="text-3xl font-extrabold">
               AI 智能体
             </p>
             <div class="text-base mt-4">
               任意场景下的回复卡片。不局限于文字、图片、语音。
             </div>
             <div class="w-full mt-10  ">
               <img class="w-full hover:scale-105 transition-all duration-300" src="https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/home_agent_temporary_v3.png">
             </div>
           </div>
           <div class="rounded-2xl    bg-gradient-to-br from-[#edf1ff] to-[#edf1ff]/50 w-full    flex flex-col items-center justify-center py-20 px-5">
             <p class="text-3xl font-extrabold">
               知识库
             </p>
             <div class="text-base mt-4">
               支持几十种文件格式，构建企业级专业知识库，不限语言。
             </div>
             <div class="w-full  mt-10 ">
               <img class="w-full hover:scale-105 transition-all duration-300" src="https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/home_datastore.png">
             </div>
           </div>
         </div>
       </div>
       <div class="w-screen bg-[url('https://pagedone.io/asset/uploads/1691055810.png')] flex items-center justify-center bg-no-repeat bg-cover pb-40">
         <div class="container  max-w-7xl flex flex-col items-center justify-center">
           <p class="mt-20 font-[HLFont-Heavy] text-4xl font-extrabold">
             产品特色
           </p>

           <div class="mt-10 rounded-2xl bg-gradient-to-br from-[#f7f7fa] to-[#f7f7fa]/50 w-full flex flex-row  pl-20 pr-10">
             <div class="flex flex-col h-full justify-center  max-w-lg  py-10">
               <p class="text-3xl font-extrabold">
                 大模型对比
               </p>
               <p class="mt-5">
                 提供模型对比工具，快速比对不同模型的回答效果。
               </p>
               <div class="mt-10 btn btn-outline w-32">
                 了解更多
               </div>
             </div>
             <div class="h-full   w-full flex justify-end items-end ">
               <img class="max-w-lg " src="https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/home_model_comparison2.png">
             </div>
           </div>
           <div class="mt-10 rounded-2xl bg-gradient-to-br from-[#f7f7fa] to-[#f7f7fa]/50 w-full flex flex-row pl-20 pr-10">
             <div class="flex flex-col h-full justify-center  max-w-lg   py-10">
               <p class="text-3xl font-extrabold">
                 特色提示词
               </p>
               <p class="mt-5">
                 依据全世界最优秀的提示词规则，辅助您快速构建提示词。
               </p>
               <div class="mt-10 btn btn-outline w-32">
                 了解更多
               </div>
             </div>
             <div class="h-full   w-full flex justify-end items-end ">
               <img class="max-w-lg " src="https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/home_model_comparison2.png">
             </div>
           </div>

           <div class="mt-10 rounded-2xl bg-gradient-to-br from-[#f7f7fa] to-[#f7f7fa]/50 w-full flex flex-row  pl-20 pr-10">
             <div class="flex flex-col h-full justify-center max-w-lg  py-10">
               <p class="text-3xl font-extrabold">
                 流程优化工具
               </p>
               <p class="mt-5">
                 记录每一步的操作记录，方便用户进行预期与实际对比，更好的优化流程。
               </p>
               <div class="mt-10 btn btn-outline w-32">
                 了解更多
               </div>
             </div>
             <div class="h-full   w-full flex justify-end items-end ">
               <img class="max-w-lg " src="https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/home_testing_tool.png">
             </div>
           </div>
         </div>
       </div>
       <div class="container  max-w-7xl flex flex-col items-center justify-center">
         <p class="mt-32 font-[HLFont-Heavy] text-4xl font-extrabold">
           数据安全
         </p>
         <div class="mt-32 grid grid-cols-3 gap-20">
           <div class="flex flex-col">
             <NuxtIcon name="rivet-icons:data-solid" size="24" />
             <p class=" max-w-xs mt-3">
               承诺不会使用企业敏感数据，用户可自行清除产生过的数据。
             </p>
           </div>
           <div class="flex flex-col">
             <NuxtIcon name="rivet-icons:data-solid" size="24" />
             <p class=" max-w-xs mt-3">
               所有数据经过 TLS加密。所有网站访问使用 HTTPS 协议。
             </p>
           </div>
           <div class="flex flex-col">
             <NuxtIcon name="rivet-icons:data-solid" size="24" />
             <p class=" max-w-xs mt-3">
               细粒度的安全权限控制，满足企业多角色和细致的管理需求。
             </p>
           </div>
           <div class="flex flex-col">
             <NuxtIcon name="rivet-icons:data-solid" size="24" />
             <p class="max-w-xs  mt-3">
               自定义的敏感词检测和企业安全敏感信息过滤，保证企业信息、数据安全和合规。
             </p>
           </div>
           <div class="flex flex-col">
             <NuxtIcon name="rivet-icons:data-solid" size="24" />
             <p class="max-w-xs  mt-3">
               支持灵活的私有化部署方案，可以配置的RAG模块。
             </p>
           </div>
           <div class="flex flex-col">
             <NuxtIcon name="rivet-icons:data-solid" size="24" />
             <p class="max-w-xs  mt-3">
               完整的系统监控策略和日志检查工具，快速定位问题和安全检查。
             </p>
           </div>
         </div>
       </div>
     </div>
   </div>
 </section>
  </section>
 
</template>
