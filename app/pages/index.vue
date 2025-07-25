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


const more = ref<Data>({
  name: '更多',
  image: 'https://resource.bantouyan.com/battleyeah-ai/ai-website/assets/home/intelligent-scene-04.png',
  list: [
    {
      icon: 'mdi:account-multiple',
      title: '多用户协作',
      desc: '支持多用户协作，支持多角色权限管理。',
    },
    {
      icon: 'mdi:cloud-sync',
      title: '云端存储',
      desc: '支持云端存储，支持数据备份与恢复。',
    },
    {
      icon: 'mdi:shield-lock',
      title: '数据安全',
      desc: '支持数据加密，支持敏感词过滤，支持数据脱敏。',
    },
    {
      icon: 'mdi:settings',
      title: '自定义配置',
      desc: '支持自定义配置，支持自定义模型、知识库、工作流等。',
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
  if (currentTabIndex.value === 3) {
    data.value = more.value
  }
}, {
  immediate: true,
  deep: true,
})

</script>

<template>
  <section data-theme="light">

    <section id="main_container" class="w-srceen relative min-h-screen  flex flex-col ">

      <div class=" bg-no-repeat bg-cover bg-[url(https://resource.bantouyan.com/battleyeah-ai/ai-website/public/img/home-bg.png)] pb-32">
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
                  全行业、全场景皆可AI重塑升级
                </p>
                <p class="mt-5      text-pretty max-w-3xl text-lg font-medium sm:text-xl">
                  智能体和工作流定制<span class="ml-2 font-extrabold   bg-gradient-to-r from-fuchsia-500   to-cyan-500 inline-block text-transparent bg-clip-text">请联系我们</span>
                </p>
                <div class="mt-14 flex items-center justify-center gap-x-6">
                  <NuxtLink to="/workflow" target="_blank" class="text-white  bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none btn px-20 text-primary-foreground hover:scale-105 transition-all duration-200">
                    免费试用<span aria-hidden="true">&rarr;</span>
                  </NuxtLink>
                  <div class="dropdown dropdown-hover">
                    <div tabindex="0" role="button" class="btn   hover:scale-105 transition-all duration-200 btn-outline px-16 m-1">
                      联系商务
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
                <p class="mt-8   text-pretty max-w-2xl text-sm opacity-80">

                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div>
        <div class="w-screen flex flex-col items-center justify-center -mt-40">
          <div class="container flex justify-center ">
            <video autoplay muted loop playsinline class="rounded-3xl  w-full h-full object-cover pointer-events-none">
              <source src="https://file.web.hlingsoft.com/GiIcsz7C4aFmJbIR0Hyes4IhHIjUgNPo/torra_video.mp4" type="video/mp4" />
              您的浏览器不支持 video 标签。
            </video>
          </div>
        </div>
      </div>

      <div class="my-20">
        <div class=" flex flex-col items-center justify-center">
          <!-- <div class="container  max-w-7xl flex flex-col items-center justify-center">
            <p class=" text-4xl font-extrabold">
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
              <p class="mt-20  text-4xl font-extrabold">
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
          </div> -->
          <div class="container  max-w-7xl flex flex-col items-center justify-center">
            <p class="mt-32  text-4xl font-extrabold">
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
