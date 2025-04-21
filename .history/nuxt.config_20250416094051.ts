// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import fs from 'node:fs'
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'
export default defineNuxtConfig({
  compatibilityDate: '2025-04-14',
  devtools: { enabled: true },
  css: [ '~/assets/css/tailwind.css','~/assets/css/main.css' ],
  plugins: ['~/plugins'],
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
 
  vite: {
    
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
    ],
  },
})
