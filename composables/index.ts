import LC from '~/models/fake-av' // 上面那个本地适配器
import * as _ from 'lodash-es'
import { customAlphabet } from 'nanoid'

import { toast } from 'vue-sonner'
import superjson from 'superjson';

function nanoLowercaseAlphanumericId(length = 4) {
  const generateId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length)
  return generateId()
}

const useToast = (title: string) => {
  toast(title)
}

function deepSanitize(obj: any, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') return obj

  if (seen.has(obj)) return '[Circular]'
  seen.add(obj)

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item, seen))
  }

  const output: any = {}
  for (const key in obj) {
    try {
      const val = obj[key]
      output[key] = typeof val === 'object' ? deepSanitize(val, seen) : val
    } catch {
      output[key] = '[Unserializable]'
    }
  }

  return output
}
const useJSONStringify = (data: any) => {

  const sanitized = deepSanitize(data)
  const { json } = superjson.serialize(sanitized)
  return JSON.stringify(json)  // ✅ 只返回 json 部分
}
export {


  LC,

  _,
  useJSONStringify,
  useToast,
  nanoLowercaseAlphanumericId,



}
