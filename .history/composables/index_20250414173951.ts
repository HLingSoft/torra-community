 
 
import { useUserStore } from '@store/user'
import { useWorkflowStore } from '@store/workflow'
import gsap from 'gsap'
import { Back, Draggable, Flip, MotionPathPlugin, Power0, ScrollTrigger, SteppedEase } from 'gsap/all'
import $ from 'jquery'

import LC from 'leancloud-storage'
import * as _ from 'lodash-es'
import { customAlphabet, nanoid } from 'nanoid'
 

const LCError = LC.Error
let isInit = false
try {
  if (isInit === false) {
    console.log('init leancloud')
    LC.init({
      appId: 'PX2dI9XU8lLzyXr3llZu3ZH8-gzGzoHsz',
      appKey: '16tTfWUGXU0d02AIPRPyT3tw',

      serverURLs: 'https://api.web.hlingsoft.com',
    })
  }
}
catch (e) {
  isInit = true
  if (e instanceof LCError) {
    console.log(e.rawMessage)
  }
}
function nanoLowercaseAlphanumericId(length = 4) {
  const generateId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length)
  return generateId()
}

// const modules = import.meta.glob('@components/workflow/node/*.vue', { eager: true })

gsap.registerPlugin(ScrollTrigger, Draggable, Flip, MotionPathPlugin, Back, SteppedEase, Power0)

interface useConfirmOptions {
  doingContent?: string
  title?: string
  content?: string
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  cancel?: () => void
  confirm?: () => void
}
function useHLToast(content: string, position = POSITION.TOP_RIGHT) {
  const toast = VueUserToast()

  toast(content, {
    position,
  })
}

function useConfirm(options: useConfirmOptions) {
  const { $useConfirmModal } = useNuxtApp()

  const teleportModal = $useConfirmModal as any

  teleportModal.show(options)
}

const ToastPosition = { ...POSITION }

export {
  $,
  _,
  Back,
  Draggable,
  Flip,
  gsap,

  LC,
  LCError,
  MotionPathPlugin,
  nanoid,
  nanoLowercaseAlphanumericId,
  Power0,

  ScrollTrigger,
  SteppedEase,
  ToastPosition,
  useCharacterStore,
  useConfirm,
  useConversationStore,
  useHLToast,
  useProductStore,
  useSCToast,
  useUserStore,
  useWorkflowStore,

}
