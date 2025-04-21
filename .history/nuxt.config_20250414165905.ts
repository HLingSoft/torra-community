// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import fs from 'node:fs'
// import path from 'node:path'
import { fileURLToPath } from 'node:url'
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [ '~/assets/css/tailwind.css'],
  // plugins: ['~/plugins'],

  nitro: {
  
    'externals': {
      inline: [],
    },
    // 'plugins': ['~/server/io.ts'],

    'experimental': {
      websocket: true,
    },
    'nitro:compiled': (_nitro) => {
      console.log('nitro:compiled')
    },
    
    'routeRules': {
      '/smarttrot/**': {
        proxy: 'https://flag.smarttrot.com/v1/**',
        changeOrigin: true,
      },
      '/lemonfox/**': {
        proxy: 'https://api.lemonfox.ai/v1/**',
        changeOrigin: true,
      },
    },
    
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    'shadcn-nuxt',
    'dayjs-nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  dayjs: {
    locales: ['zh-cn'],
    // defaultLocale: 'zh-cn',
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
  css: ['~/assets/css/tailwind.css'],
  alias: {
    '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
    '@utils': fileURLToPath(new URL('./utils', import.meta.url)),
    '@store': fileURLToPath(new URL('./store', import.meta.url)),
    '@worker': fileURLToPath(new URL('./worker', import.meta.url)),
    '@models': fileURLToPath(new URL('./models', import.meta.url)),
    '@identifier': fileURLToPath(new URL('./identifier', import.meta.url)),
    '@entities': fileURLToPath(new URL('./entities', import.meta.url)),
    '@components': fileURLToPath(new URL('./components', import.meta.url)),
    '@/components': fileURLToPath(new URL('./components', import.meta.url)),
    '@composables': fileURLToPath(new URL('./composables', import.meta.url)),

  },
  vite: {
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
    ],
  },
})
