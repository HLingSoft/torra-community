import type { Component } from 'vue'

function toKebabCase(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export function useNodeComponentMap() {
  //@ts-ignore
  const modules = import.meta.glob('~/components/workflow/node/**/*.vue', { eager: true }) as Record<
    string,
    { default: Component }
  >

  const map = Object.fromEntries(
    Object.entries(modules).map(([path, mod]) => {
      const rawName = path
        .replace(/^.*\/node\//, '')   // e.g. input/textInput.vue
        .replace(/\.vue$/, '')        // e.g. input/textInput
      const kebabName = rawName
        .split('/')
        .map(toKebabCase)             // input/text-input
        .join('/')
      return [kebabName, mod.default]
    }),
  )

  return map
}
