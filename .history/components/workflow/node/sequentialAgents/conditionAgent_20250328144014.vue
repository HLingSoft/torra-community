<script lang="ts" setup>
import { Button } from '@components/shadcn/ui/button'
// import { addInputPort, addOutputPort, removeOutputPort, updateNodeData } from '@components/workflow/useNodePorts'
import { createPortManager } from '@components/workflow/useNodePorts'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useVueFlow } from '@vue-flow/core'

import { promiseTimeout } from '@vueuse/core'
import '@assets/css/_node.scss'

// 引入公共样式
const props = defineProps({
  id: String,
  // data: Object,
})

const { addInputPort, addOutputPort, updateNode, removeOutputPort, updateNodePosition } = createPortManager()

const componentInfo = {
  name: '条件选择执行控制器',
  description: '条件选择执行控制器',
  icon: 'hugeicons:flow-square',
}

interface ConditionAgent {
  name: string
  description: string
}

interface Condition {
  index: number
  name: string
  id: string
  description?: string
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

const currentConditionAgent = ref<ConditionAgent>({
  name: '选择器',
  description: '',
})
// const nodeId=nanoLowercaseAlphanumericId(10)
// 创建一个 ref 来保存 card 元素的高度
const cardHeight = ref(0)

// 获取 card 的 DOM 元素引用
const card = ref<HTMLDivElement | null>(null)

// 获取 card 的高度并更新
const updateCardHeight = () => {
  if (card.value) {
    cardHeight.value = card.value.offsetHeight
  }
}
enum EnumInputDataType {
  STRING = 'string',
  JSON = 'json',
  ARRAY = 'array',
  IMAGE = 'image',
  VOICE = 'voice',

}
interface InputDataType {
  name: string
  value: EnumInputDataType
}
const allInputDataType = [
  {
    name: '字符串',
    value: EnumInputDataType.STRING,
  },
  {
    name: 'JSON',
    value: EnumInputDataType.JSON,
  },
  {
    name: '数组',
    value: EnumInputDataType.ARRAY,
  },
] as InputDataType[]
// const inputDataType = ref<InputDataType>(allInputDataType[0])
onMounted(() => {
  updateCardHeight()
  // 默认有一个 input 节点
  // console.log('props.id', props.id)
  // console.log(props.id!, nanoLowercaseAlphanumericId(10))
  addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', 20)
})
const addCondition = async () => {
  const id = nanoLowercaseAlphanumericId(10)
  const index = allCondition.value.length
  allCondition.value.push({
    index,
    name: '',
    id,
  })
  await nextTick()
  const y = await getY(id)
  console.log('y', y)
  addOutputPort(props.id!, id, 'pink', 280, y)
}

const waitForDOMStability = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })

const removeCondition = async (id: string) => {
  const condition = allCondition.value.find(item => item.id === id)
  if (condition) {
    allCondition.value = allCondition.value.filter(item => item.id !== id)
    removeOutputPort(condition.id)
  }
  await waitForDOMStability()

  for (const condition of allCondition.value) {
    await nextTick()
    await updateOutputPortPosition(condition)
  }
}
const getY = async (id: string, isUpdated = false) => {
  await nextTick()
  // 获取 DOM 元素
  const conditionEl = document.getElementById(`condition-${id}`)
  const cardEl = card.value

  let y = 190 // fallback 值

  if (conditionEl && cardEl) {
    const conditionRect = conditionEl.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()

    y = conditionRect.top - cardRect.top // +10 是微调
    if (isUpdated) {
      y += 10.5
    }
  }

  return y
}
const updateOutputPortPosition = async (condition: Condition) => {
  const y = await getY(condition.id, true)
  updateNodePosition(condition.id, {
    x: 280,
    y,
  })
}
const { onNodeClick } = useVueFlow()
onNodeClick((nodeId: string) => {
  console.log('nodeId', nodeId)
})
</script>

<template>
  <Sheet class="" :modal="false">
    <SheetTrigger>
      <div ref="card" class="relative  w-96 text-white bg-[#2b2a2a] rounded-lg">
        <Card>
          <CardHeader>
            <CardTitle class="text-white flex flex-row space-x-4 items-center   ">
              <NuxtIcon :name="componentInfo.icon" size="18" />
              <div>{{ componentInfo.name }}</div>
            </CardTitle>
            <!-- <Separator class="mt-5 mb-3" /> -->
            <CardDescription class="bg-gray-500 mt-3 text-white p-2 rounded-lg">
              {{ currentConditionAgent.name }}
              <!-- 输入类型: {{ inputDataType.name }} -->
            </CardDescription>
          </CardHeader>

          <CardContent class="text-white space-y-5  ">
            <Separator class="my-1" />

            <div v-auto-animate>
              <div id="conditionContainer" class="flex flex-row items-center justify-between  pb-2">
                <div>条件分支:</div>
                <div class="flex flex-row items-center ">
                </div>
              </div>

              <div class="flex flex-col space-y-4  ">
                <div v-for="condition in allCondition" :key="condition.id" class="mt-3 h-8 flex flex-row items-center max-w-80 truncate ">
                  <div :id="`condition-${condition.id}`" class="text-sm">
                    {{ condition.name }}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <!-- <Separator class="my-3"></Separator> -->
          <CardFooter class="text-white">
            <!-- 这里也不知道写什么 -->
          </CardFooter>
        </Card>
      </div>
    </SheetTrigger>
    <SheetContent class="h-[90vh] font-[HLFont-Normal] w-[600px] mt-[5vh] mr-10 rounded-xl  ">
      <SheetHeader>
        <SheetTitle class="flex flex-row items-center space-x-2">
          <NuxtIcon :name="componentInfo.icon" size="18" />
          <div>{{ componentInfo.name }}</div>
        </SheetTitle>
        <SheetDescription class="mt-2">
        </SheetDescription>
      </SheetHeader>
      <Separator class="my-3" />
      <ScrollArea class="h-[calc(90vh-11rem)]   ">
        <div class="flex flex-col space-y-5">
          <FormField name="name">
            <FormItem v-auto-animate>
              <FormLabel>
                名称
              </FormLabel>
              <FormControl>
                <div class="m-1 ">
                  <Input v-model="currentConditionAgent.name" type="text" placeholder="" />
                </div>
              </FormControl>
              <FormDescription>
                请填写名称
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="inputDataType">
            <FormItem v-auto-animate>
              <FormLabel>
                <div class="flex flex-row items-center space-x-2 justify-between">
                  <div>
                    <div>条件设置</div>
                    <div></div>
                  </div>
                  <div>
                    <Button variant="outline" size="xs" @click="addCondition">
                      <NuxtIcon name="basil:add-outline" class="mr-2" size="20"></NuxtIcon>添加
                    </Button>
                  </div>
                </div>
              </FormLabel>
              <FormControl>
                <Tabs :default-value="EnumInputDataType.STRING" class="w-full mt-5">
                  <TabsList>
                    <TabsTrigger :value="EnumInputDataType.STRING">
                      文本
                    </TabsTrigger>
                    <TabsTrigger disabled :value="EnumInputDataType.IMAGE">
                      图片
                    </TabsTrigger>
                    <TabsTrigger disabled :value="EnumInputDataType.VOICE">
                      语音
                    </TabsTrigger>
                    <TabsTrigger disabled :value="EnumInputDataType.JSON">
                      JSON对象
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent :value="EnumInputDataType.STRING">
                    <div class="text-sm font-light text-muted-foreground">
                      如果输入是文本
                    </div>
                    <div class="flex flex-col mt-6 space-y-6 px-1 text-sm">
                      <div v-for="(condition, index) in allCondition" :key="condition.id" class="flex flex-row items-center gap-x-5  ">
                        <div class="">
                          {{ index + 1 }}. 意图是
                        </div>
                        <Input v-model="condition.name" type="text" placeholder="请输入条件" class="w-40" />
                        <div @click="removeCondition(condition.id)">
                          <NuxtIcon name="fluent:delete-32-regular" class="text-red-500 cursor-pointer" size="20" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent :value="EnumInputDataType.JSON">
                    <div class="text-sm font-light text-muted-foreground">
                      如果输入是结构化对象
                    </div>
                    <div class="flex flex-col mt-6 space-y-6 px-1">
                      <div v-for="condition in allCondition" :key="condition.index" class="flex flex-col  space-y-5   ">
                        <div class="flex flex-row items-center gap-x-5  ">
                          <div class="">
                            如果 Key
                          </div>
                          <Input v-model="condition.name" type="text" placeholder="请输入Key 的 Name" class="w-40" />
                          <div class="">
                            的值
                          </div>
                        </div>
                        <div class="flex flex-row items-center gap-x-5">
                          <Select>
                            <SelectTrigger class="">
                              <SelectValue placeholder="选择条件" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="lt">
                                  小于
                                </SelectItem>
                                <SelectItem value="lte">
                                  小于等于
                                </SelectItem>
                                <SelectItem value="eq">
                                  等于
                                </SelectItem>
                                <SelectItem value="gte">
                                  大于等于
                                </SelectItem>
                                <SelectItem value="gt">
                                  大于
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Input type="text" placeholder="请输入Value 的值" class="w-40" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
          <Separator class="my-3" />
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>
