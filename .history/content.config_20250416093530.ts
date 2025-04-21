import { defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  // @ts-expect-error: not yet in exported types
  documentDriven: true,
  highlight: {
    theme: 'github-dark'
  }
})
