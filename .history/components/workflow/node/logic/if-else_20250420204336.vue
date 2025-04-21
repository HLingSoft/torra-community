<script lang="ts" setup>
import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
import type { IfElseData } from '@/types/node-data/if-else'
 import { ifElseMeta } from '@/types/node-data/if-else'
 
// 引入公共样式
const props = defineProps({
  id: String,

})
const { nodes, edges } = storeToRefs(useWorkflowStore())
const currentNode =ref<{ id: string, data?: IfElseData }>()
const textInputRef = ref<HTMLElement | null>(null)
const messageRef = ref<HTMLElement | null>(null)
const matchTextRef = ref<HTMLElement | null>(null)

const trueRef = ref<HTMLElement | null>(null)
const falseRef = ref<HTMLElement | null>(null)
const { addInputPort, addOutputPort, updateNodePosition ,removePort} = createPortManager()
 
onMounted(async () => {
  const node = nodes.value.find(node => node.id === props.id)
  if (!node) {
    return
  }

  // 初始化 data
  node.data = {
    ..._.cloneDeep(ifElseMeta),
    ..._.cloneDeep(node.data), // ✅ 已有字段优先级更高，会覆盖默认值
  } as IfElseData

  currentNode.value = node
  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port

  // console.log(currentNode.value.data.matchType)
 
  if (textInputRef.value && !node.data.saved) {
    currentNode.value.data!.textInputVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.textInputVariable.id, 'aquamarine', textInputRef.value.offsetTop + textInputRef.value.clientHeight / 2)
  }

  if (messageRef.value && !node.data.saved) {
    currentNode.value.data!.messageVariable.id = nanoLowercaseAlphanumericId(10)  
    addInputPort(props.id!,   currentNode.value.data!.messageVariable.id , 'aquamarine', messageRef.value.offsetTop + messageRef.value.clientHeight / 2 - 10)
  }

  if (matchTextRef.value && !node.data.saved && currentNode.value!.data!.matchType === 'String') {
    currentNode.value.data!.matchTextVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(props.id!, currentNode.value.data!.matchTextVariable.id, 'aquamarine', matchTextRef.value.offsetTop + matchTextRef.value.clientHeight / 2 - 10)
  }

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (trueRef.value && !node.data.saved) {
    currentNode.value.data!.trueOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.trueOutputVariable.id , 'pink', trueRef.value.offsetTop + trueRef.value.clientHeight / 2)
  }

  if (falseRef.value && !node.data.saved) {
    currentNode.value.data!.falseOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(props.id!, currentNode.value.data!.falseOutputVariable.id, 'pink', falseRef.value.offsetTop + falseRef.value.clientHeight / 2)
  }
})

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})

 
 

 

// const operator = ref('equals')
const allOperator = [
  { value: 'equals', label: 'Equals',matchType:'String'  },
  { value: 'contains', label: 'Contains' ,matchType:'String' },
  { value: 'startsWith', label: 'Starts With',matchType:'String'  },
  { value: 'endsWith', label: 'Ends With' ,matchType:'String' },
  { value: 'matches', label: 'Matches' ,matchType:'String' },
  { value: 'isEmpty', label: 'Is Empty',matchType:'String'  },
  { value: 'isNotEmpty', label: 'Is Not Empty',matchType:'String'  },
  { value: 'isNull', label: 'Is Null',matchType:'String' },
  { value: 'isNotNull', label: 'Is Not Null',matchType:'String' },
  { value: "true", label: 'Is True',matchType:'Boolean' },
  { value: "false", label: 'Is False',matchType:'Boolean' },
  
]

watch(edges, () => {
 
  if (!currentNode.value?.data) {
    return
  }

  currentNode.value.data.textInputVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.textInputVariable.id)
  currentNode.value.data.matchTextVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.matchTextVariable.id)
  currentNode.value.data.messageVariable.connected = edges.value.some(edge => edge.target === currentNode.value!.data!.messageVariable.id)
}, { deep: true, immediate: true })

watch(
  () => currentNode.value?.data?.matchType,
  async (newType) => {
    if (!currentNode.value?.data ) return

    await nextTick() // 等 DOM 渲染完，ref 才能获取正确位置

    const data = currentNode.value.data

    // 1. 🔄 处理 matchTextVariable
    if (newType === 'String' && matchTextRef.value) {
      // 添加 port（如果没有就加）
      const id = data.matchTextVariable.id || nanoLowercaseAlphanumericId(10)
      data.matchTextVariable.id = id
      const y = matchTextRef.value.offsetTop + matchTextRef.value.clientHeight / 2 - 10
      addInputPort(props.id!, id, 'aquamarine', y)
    }

    // if (newType === 'Boolean') {
    //   // 删除 port（如果存在）
    //   if (data.matchTextVariable?.id) {
    //     removePort(data.matchTextVariable.id)
    //   }
    // }

    // // 2. 🔄 更新 messageRef port 和位置
    // if (messageRef.value) {
    //   const id = data.messageVariable.id || nanoLowercaseAlphanumericId(10)
    //   data.messageVariable.id = id
    //   const y = messageRef.value.offsetTop + messageRef.value.clientHeight / 2 - 10
      
    //   updateNodePosition(props.id!, y  ) // 更新节点整体位置（如有需要）
    // }

    // // 3. 🔄 更新 trueRef port 和位置
    // if (trueRef.value) {
    //   const id = data.trueOutputVariable.id || nanoLowercaseAlphanumericId(10)
    //   data.trueOutputVariable.id = id
    //   const y = trueRef.value.offsetTop + trueRef.value.clientHeight / 2
    //   updateNodePosition(props.id!, y ) // 更新节点整体位置（如有需要）
    // }

    // // 4. 🔄 更新 falseRef port 和位置
    // if (falseRef.value) {
    //   const id = data.falseOutputVariable.id || nanoLowercaseAlphanumericId(10)
    //   data.falseOutputVariable.id = id
    //   const y = falseRef.value.offsetTop + falseRef.value.clientHeight / 2
    //   updateNodePosition(props.id!, y ) // 更新节点整体位置（如有需要）
    // }
  } 
)
 
</script>

<template>
  <Card v-if=" currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]   rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
    <NodeCardHeader v-if="id" :nodeData="currentNode.data" :id="id"/>
  
    <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />
      <div ref="textInputRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Input<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
         

          <GlobalVariablePopover
        
          :disabled="currentNode.data.textInputVariable.connected"
          :model-value="currentNode.data.textInputVariable.value || ''"
          
          placeholder="Typing something"
          @save="(val) => currentNode!.data!.textInputVariable.value = val" >
          </GlobalVariablePopover>


        </div>
      </div>
      <div ref="matchTextRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Match Type<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="filter dark">
            <input class="btn  btn-sm btn-outline filter-reset" type="radio"  v-model="currentNode.data.matchType"  value="All"     name="matchType" aria-label="All"/>
            <input class="btn btn-sm btn-outline" type="radio"     value="String"   v-model="currentNode.data.matchType"   name="matchType" aria-label="String"/>
            <input class="btn  btn-sm  btn-outline" type="radio"    value="Boolean"   v-model="currentNode.data.matchType"    name="matchType"   aria-label="Boolean"/>
        
          </div>
        


        </div>
      </div>
     

      <div v-if="currentNode.data.matchType==='String'" ref="matchTextRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Match Text<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
       
          <EditTextDialog
            class="w-full"
            :disabled="currentNode.data.matchTextVariable.connected"
            :model-value="currentNode.data.matchTextVariable.value || ''"
            placeholder="请输入文本"
            @save="(val) => currentNode!.data!.matchTextVariable.value = val"
          />
 


        </div>
      </div>
      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>Operator<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center    mt-5">
          <Select class="w-full" v-model="currentNode.data.operator">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a operator" />
            </SelectTrigger>
            <SelectContent class="dark max-h-72 overflow-y-auto">
              <SelectGroup>
                <SelectItem v-for="item in allOperator" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
        <div class="flex flex-row items-center space-x-2">
          <p>Case Sensitive</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>

        <Switch
          v-model="currentNode.data!.caseSensitive"
        />
      </div>

      <div ref="messageRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Message</p>
          <div class="tooltip tooltip-warning" data-tip="附带/携带额外的信息">
            <NuxtIcon name="clarity:info-line" size="20" />
        </div>
          
        </div>
        <div class="w-full  mt-5">
          <EditTextDialog
            class="w-full"
            :disabled="currentNode.data.messageVariable.connected"
            :model-value="currentNode.data.messageVariable.value || ''"
            placeholder="请输入文本"
            @save="(val) => currentNode!.data!.messageVariable.value = val"
          />

          <!-- <GlobalVariablePopover
          class="w-full"
          :disabled="currentNode.data.messageVariable.connected"
          :model-value="currentNode.data.messageVariable.value || ''"
          
          placeholder="Typing something"
          @save="(val) => currentNode!.data!.messageVariable.value = val" >
          </GlobalVariablePopover> -->




        </div>
      </div>
    </CardContent>

    <div ref="trueRef" class="bg-[#27272A]    py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon
          v-if="currentNode.data.trueOutputVariable.show"
          name="lets-icons:view-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.trueOutputVariable.show = false"
        />

        <NuxtIcon
          v-else
          name="lets-icons:view-hide-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.trueOutputVariable.show = true"
        />

        <div class="   ">
          True | Message
        </div>
      </div>
    </div>
    <div ref="falseRef" class="bg-[#27272A]  -mt-5  rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon
          v-if="currentNode.data.falseOutputVariable.show"
          name="lets-icons:view-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.falseOutputVariable.show = false"
        />

        <NuxtIcon
          v-else
          name="lets-icons:view-hide-duotone"
          size="24"
          class="cursor-pointer"
          @click="currentNode.data.falseOutputVariable.show = true"
        />

        <div class=" ">
          False | Message
        </div>
      </div>
    </div>
  </Card>
</template>
