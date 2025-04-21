<script lang="ts" setup>
import { Button } from '~/components/ui/button'
// import { addInputPort, addOutputPort, removeOutputPort } from '@components/workflow/useNodePorts'
import { createPortManager } from '@components/workflow/useNodePorts'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { onMounted } from 'vue'
import * as z from 'zod'
import '@assets/css/_node.scss'
// 引入公共样式
const props = defineProps({
  id: String,
  // data: Object,
})
const { addInputPort, addOutputPort, updateNode, removeOutputPort } = createPortManager()

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2).max(50),
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})
interface Condition {
  name: string
  description: string
}
const allCondition = ref<Condition[]>([
  // {
  //   name: '条件1',
  //   description: '这是条件1的描述',

  // },
  // {
  //   name: '条件2',
  //   description: '这是条件2的描述',
  // },

])

const currentConditionAgent = ref<Condition>({
  name: '',
  description: '',
})
// const nodeId=nanoLowercaseAlphanumericId(10)

onMounted(() => {
  // 默认有一个 input 节点
  // console.log('props.id', props.id)
  // console.log(props.id!, nanoLowercaseAlphanumericId(10))
//   addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', 20)
  addOutputPort(props.id!, nanoLowercaseAlphanumericId(10), 'gold', 75, 28)
  // addInputPorts(props)
})
</script>

<template>
  <div theme="night" class="flex text-[#ffd700] flex-row items-center space-x-3 justify-center  w-40 h-16   bg-[#2b2a2a] rounded-lg">
    <NuxtIcon name="material-symbols-light:line-start-circle" size="28" />
    <div>开始节点</div>
  </div>
</template>
