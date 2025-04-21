// import mk from '@traptitech/markdown-it-katex'
// import hljs from 'highlight.js'
// import MarkdownIt from 'markdown-it'

// import markdownItAttrs from 'markdown-it-attrs'
// import container from 'markdown-it-container'
// import def from 'markdown-it-deflist'
// import emo from 'markdown-it-emoji'
// import fn from 'markdown-it-footnote'
// import ins from 'markdown-it-ins'
// import sub from 'markdown-it-sub'
// import sup from 'markdown-it-sup'
// import 'highlight.js/styles/atom-one-dark-reasonable.css'

// export default defineNuxtPlugin(() => {
//   // const md: MarkdownIt = MarkdownIt({
//   //   html: true,
//   //   linkify: true,
//   //   typographer: true,
//   //   highlight(str: string, lang: string) {
//   //     if (lang && hljs.getLanguage(lang)) {
//   //       try {
//   //         return `<div class="hl-code"><div class="hl-code-header"><span>${lang}</span></div><div class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
//   //         }</code></div></div>`
//   //       }
//   //       catch (__) {
//   //         console.log(__, 'error')
//   //       }
//   //     }
//   //     return `<div class="hl-code"><div class="hl-code-header"><span>${lang}</span></div><div class="hljs"><code>${md.utils.escapeHtml(
//   //       str,
//   //     )}</code></div></div>`
//   //   },

//   // })
//   // md.use(mk, { blockClass: 'math-block', errorColor: ' #cc0000' })
//   const md: MarkdownIt = new MarkdownIt({
//     html: true,
//     xhtmlOut: false,
//     breaks: false,
//     langPrefix: 'language-',
//     linkify: true,
//     typographer: true,
//     quotes: '“”‘’',
//     highlight(str, lang) {
//       if (lang && hljs.getLanguage(lang)) {
//         try {
//           return `<pre class="hljs"><code>${
//             hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
//           }</code></pre>`
//         }
//         catch (error) { console.log(error) }
//       }

//       return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
//     },
//   })
//     .use(sub)
//     .use(sup)
//     .use(fn)
//     .use(emo)
//     .use(def)
//     .use(ins)
//     .use(container, 'codeblock', { marker: '@' })
//     .use(markdownItAttrs)

//   md.linkify.set({ fuzzyEmail: false })

//   return {
//     provide: {
//       mdRenderer: md,
//     },
//   }
// })

import mk from '@traptitech/markdown-it-katex'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import Highlight from 'markdown-it-highlightjs'
import 'highlight.js/styles/atom-one-dark-reasonable.css'

export default defineNuxtPlugin(() => {
  const md: MarkdownIt = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<div class="hl-code"><div class="hl-code-header"><span>${lang}</span></div><div class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          }</code></div></div>`
        }
        catch (__) {
          console.log(__, 'error')
        }
      }
      return `<div class="hl-code"><div class="hl-code-header"><span>${lang}</span></div><div class="hljs"><code>${md.utils.escapeHtml(
        str,
      )}</code></div></div>`
    },

  })
  md.use(mk, { blockClass: 'math-block', errorColor: ' #cc0000' })
  md.use(Highlight)

  return {
    provide: {
      mdRenderer: md,
    },
  }
})
