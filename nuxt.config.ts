import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from 'vite-tsconfig-paths'


export default defineNuxtConfig({

  compatibilityDate: '2025-05-15',

  devtools: { enabled: false },

  css: ['~/assets/css/tailwind.css', '~/assets/css/main.css'],

  typescript: {
    typeCheck: true
  },
  app: {
    baseURL: '/',

    pageTransition: { name: 'slide-fade', mode: 'out-in' },
    layoutTransition: { name: 'slide-fade', mode: 'out-in' },

    head: {
      // htmlAttrs: {
      //   lang: 'zh_cn',
      // },

      title: 'Torra- 智能体与工作流',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'description',
          content: 'Torra 是恒领软件推出的完全开源企业级 AI 平台，集成智能体系统与 AI 工作流引擎，支持私有部署，助力企业实现智能自动化。'
        },
        {
          name: 'keywords',
          content: 'Torra, AI 工作流, 企业级 AI 平台, 开源智能体框架, 多智能体系统, 私有部署 AI, 恒领软件, ChatGPT'
        },
        { name: 'robots', content: 'index, follow' },

        // Open Graph（社交媒体预览）
        { property: 'og:title', content: 'Torra - 开源企业级 AI 平台 | 恒领软件' },
        {
          property: 'og:description',
          content: '恒领软件推出的 Torra 平台，专注企业级 AI 工作流与多智能体自动化，支持私有部署与模块化扩展。'
        },
        { property: 'og:image', content: 'https://www.torra.cloud/og-image.jpg' },
        { property: 'og:url', content: 'https://www.torra.cloud' },
        { property: 'og:type', content: 'website' },

        // Twitter 卡片
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Torra - 开源 AI 工作流与智能体平台' },
        {
          name: 'twitter:description',
          content: '私有部署的企业级 AI 平台，支持多智能体协同与流程自动化。'
        },
        { name: 'twitter:image', content: 'https://www.torra.cloud/twitter-image.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' },
      ],


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
    '@nuxtjs/mdc',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode'
  ],
  colorMode: {

    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  shadcn: {
    prefix: '',
    componentDir: 'app/components/ui',
  },

  dayjs: {
    locales: ['zh-cn'],
    defaultLocale: 'zh-cn',
    plugins: ['relativeTime', 'isBetween', 'utc', 'timezone'],
    defaultTimezone: 'Asia/Shanghai',

  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  icon: {

    componentName: 'NuxtIcon',
  },

  mdc: {
    // ① Shiki 代码高亮
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      },
      langs: ['js', 'ts', 'vue', 'bash', 'json']
    },


    rehypePlugins: {
      'rehype-external-links': {
        options: {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],  // 防止反向控制
          protocols: ['http', 'https']      // 只处理外链，站内相对链接保持原状
        }
      }
    }
  },
  i18n: {
    // bundle: {
    //   optimizeTranslationDirective: false,
    // },
    locales: [
      {
        code: 'zh-CN',
        name: '简体中文',
        file: 'zh-CN.json',
        iso: 'zh-CN'
      },
      {
        code: 'zh-TW',
        name: '繁體中文',
        file: 'zh-TW.json',
        iso: 'zh-TW'
      },
      {
        code: 'en',
        name: 'English',
        file: 'en-US.json',
        iso: 'en-US'
      },


      {
        code: 'ja',
        name: '日本語',
        file: 'ja-JP.json',
        iso: 'ja-JP'
      }
    ],

    defaultLocale: 'zh-CN',
    // lazy: true,
    langDir: 'locales/', // 确保你的语言文件放在这个目录下
    strategy: 'no_prefix' // 也可以改成 prefix_except_default 或 prefix，根据需要

  },
  vite: {

    plugins: [
      tsconfigPaths() as any,
      tailwindcss(),
    ],
  }

})
