import LC from '~/models/fake-av' // 上面那个本地适配器
import * as _ from 'lodash-es'
import { customAlphabet } from 'nanoid'

import { toast } from 'vue-sonner'


function nanoLowercaseAlphanumericId(length = 4) {
  const generateId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length)
  return generateId()
}

const useToast = (title: string) => {
  toast(title)
}
export {


  LC,

  _,

  useToast,
  nanoLowercaseAlphanumericId,



}
