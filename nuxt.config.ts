// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import fs from 'node:fs'
import path from 'node:path'
// import { fileURLToPath } from 'node:url'
export default defineNuxtConfig({
  compatibilityDate: '2025-04-14',
  devtools: { enabled: false },
  css: [ '~/assets/css/tailwind.css','~/assets/css/main.css' ],
  plugins: ['~/plugins'],
  app: {
    baseURL: '/',

    pageTransition: { name: 'slide-fade', mode: 'out-in' },
    layoutTransition: { name: 'slide-fade', mode: 'out-in' },

    head: {
      // htmlAttrs: {
      //   lang: 'zh_cn',
      // },

      title: 'AskPro- 智能体与工作流',
      meta: [
        { charset: 'utf-8' },
        { name: 'description', content: 'AskPro 是恒领软件提出的，企业级AI 智能体和工作流。脱胎于ChatGPT的慢思考模型。安全、高效、稳定。' },
        { name: 'keywords', content: 'AI, AskPro, 智能体, AI 工作流, 恒领软件, ChatGPT' },
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
  
    'externals': {
      inline: [],
    },
    'plugins': ['~/server/io.ts'],

    'experimental': {
      websocket: true,

    },
  
    
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    'shadcn-nuxt',
    'dayjs-nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'motion-v/nuxt'
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
  // content: {
  //   build: {
  //     markdown: {
  //       highlight: {

  //         theme: {
  //           // Default theme (same as single string)
  //           default: 'github-light',
  //           // Theme used if `html.dark`
  //           dark: 'github-dark',
  //           // Theme used if `html.sepia`
  //           sepia: 'monokai'
  //         }
  //       }
  //     }
  //   }
  // },
  hooks: {
    'nitro:build:public-assets': (_nitro: any) => {
      const sourceDir = path.resolve(__dirname, 'node_modules/@zilliz/milvus2-sdk-node/dist/proto')
      const destDir = path.resolve(__dirname, '.output/server/node_modules/@zilliz/milvus2-sdk-node/dist/proto')
      const copyDir = (src: string, dest: string): void => {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true })
        }
        fs.readdirSync(src).forEach((file) => {
          const srcFile = path.resolve(src, file)
          const destFile = path.resolve(dest, file)
          if (fs.lstatSync(srcFile).isDirectory()) {
            copyDir(srcFile, destFile)
          }
          else {
            fs.copyFileSync(srcFile, destFile)
          }
        })
      }
      copyDir(sourceDir, destDir)
      console.log('Proto files copied successfully!')
    },
  },
  vite: {
    
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
    ],
  },
})
