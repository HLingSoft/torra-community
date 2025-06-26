export {}

declare global {
  interface Window {
    $: any
    jquery: any
    window: any
    browser: any
    ApexCharts: any
    webkitAudioContext: any
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {

    $mdRenderer: any // Replace `YourMarkdownRendererType` with the actual type of your `$mdRenderer`
  }
}

declare module 'vue' {
  export interface Ref<T = any> {
    value: T
  }
}
