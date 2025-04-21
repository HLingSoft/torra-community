import type { Component } from 'vue'

export function useNodeComponentMap() {
  //@ts-ignore
  const modules = import.meta.glob('~/components/workflow/node/**/*.vue', { eager: true }) as Record<
    string,
    { default: Component }
  >

  const map = Object.fromEntries(
    Object.entries(modules).map(([path, mod]) => {
      const name = path
        .replace(/^.*\/node\//, '') // 去掉路径前缀，保留 node/ 后的部分
        .replace(/\.vue$/, '') // 去掉 .vue 后缀
      return [name, mod.default]
    }),
  )

  return map
}
