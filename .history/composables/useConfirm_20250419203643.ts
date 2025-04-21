import { reactive } from 'vue'

export const confirmState = reactive({
  show: false,
  title: '',
  description: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  resolve: (v: boolean) => {},
})

export function useConfirm(options: {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}): Promise<boolean> {
  return new Promise((resolve) => {
    Object.assign(confirmState, {
      ...options,
      show: true,
      resolve,
    })
  })
}
