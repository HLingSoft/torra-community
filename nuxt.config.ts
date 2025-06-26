
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineNuxtConfig({

  devtools: { enabled: false },
  css: ['~/assets/css/tailwind.css', '~/assets/css/main.css'],
  plugins: ['~/plugins'],

  app: {
    baseURL: '/',

    pageTransition: { name: 'slide-fade', mode: 'out-in' },
    layoutTransition: { name: 'slide-fade', mode: 'out-in' },

    head: {


      title: 'Torra- 智能体与工作流',
      meta: [
        { charset: 'utf-8' },
        { name: 'description', content: 'Torra 企业级工作流编辑器' },
        { name: 'keywords', content: 'AI, Torra, 智能体, AI 工作流, 恒领软件, ChatGPT' },
        { name: 'robots', content: 'index, follow' }, // 全局允许搜索引擎抓取
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' },
      ],


    },
  },

  nitro: {

    preset: 'node-server', // ✅ 必须是 node-server
    'experimental': {
      websocket: true,

    },



  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    'shadcn-nuxt',
    'dayjs-nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/mdc',
  ],

  dayjs: {
    locales: ['zh-cn'],
    defaultLocale: 'zh-cn',
    plugins: ['relativeTime'],
    defaultTimeZone: 'Asia/Shanghai',
    defaultFormat: 'YYYY-MM-DD HH:mm:ss',
  },

  pinia: {
    autoImports: ['storeToRefs'],
    storesDirs: ['./stores/**'],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },

  icon: {
    global: true, // 确保在全局注册 NuxtIcon
    componentName: 'NuxtIcon',
  },
  mdc: {
    highlight: {
      theme: 'github-dark', // 或 'github-light'、'nord' 等
    }
  },


  vite: {

    plugins: [
      tsconfigPaths(),
      tailwindcss(),
    ],
  },
  compatibilityDate: '2025-06-26'
})
