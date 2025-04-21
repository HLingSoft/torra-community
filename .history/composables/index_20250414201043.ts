
 
import LC from 'leancloud-storage'
import * as _ from 'lodash-es'
import { customAlphabet, nanoid } from 'nanoid'
 
import { toast } from 'vue-sonner'
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
  
const useToast=()=>{
  toast('Event has been created', {
    description: 'Sunday, December 03, 2023 at 9:00 AM',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  })
}
export {
 

  LC,
  LCError,
  _,
 
  nanoid,
  nanoLowercaseAlphanumericId,
 
 

}
