
// import mk from '@traptitech/markdown-it-katex'
// import hljs from 'highlight.js'
// import MarkdownIt from 'markdown-it'
// import Highlight from 'markdown-it-highlightjs'
// import 'highlight.js/styles/atom-one-dark-reasonable.css'

// export default defineNuxtPlugin(() => {
//   const md: MarkdownIt = MarkdownIt({
//     html: true,
//     linkify: true,
//     typographer: true,
//     highlight(str: string, lang: string) {
//       if (lang && hljs.getLanguage(lang)) {
//         try {
//           return `<div class="hl-code"><div class="hl-code-header"><span>${lang}</span></div><div class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
//           }</code></div></div>`
//         }
//         catch (__) {
//           console.log(__, 'error')
//         }
//       }
//       return `<div class="hl-code"><div class="hl-code-header"><span>${lang}</span></div><div class="hljs"><code>${md.utils.escapeHtml(
//         str,
//       )}</code></div></div>`
//     },

//   })
//   md.use(mk, { blockClass: 'math-block', errorColor: ' #cc0000' })
//   md.use(Highlight)

//   return {
//     provide: {
//       mdRenderer: md,
//     },
//   }
// })
