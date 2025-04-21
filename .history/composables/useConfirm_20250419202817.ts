let confirmRef: any = null

export const useConfirm = () => {
  if (!confirmRef) {
    throw new Error('ConfirmDialog is not mounted. Make sure to include <ConfirmDialog ref="confirmRef" /> somewhere in your app.')
  }

  return {
    confirm: confirmRef.confirm,
  }
}

export const injectConfirmRef = (refInstance: any) => {
  confirmRef = refInstance
}
