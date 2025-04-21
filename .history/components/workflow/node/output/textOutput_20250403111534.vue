<script lang="ts" setup>
import { Button } from '@components/shadcn/ui/button'
 
import { createPortManager } from '@components/workflow/useNodePorts'
 
import { useVueFlow } from '@vue-flow/core'

//  import { Handle,Position } from '@vue-flow/core'
 

// 引入公共样式
const props = defineProps({
  id: String
 
})
const currentNode=ref()
const { addInputPort, addOutputPort, updateNode, removeOutputPort, updateNodePosition } = createPortManager()
 const { nodes}=storeToRefs(useWorkflowStore())
onMounted(async () => {
 
    currentNode.value = nodes.value.find((node) => node.id === props.id)
    console.log('currentNode', currentNode.value)
    await nextTick() // 等待 DOM 渲染完毕
  addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', 25)
  await nextTick() // 等待 DOM 渲染完毕

  const footerEl = footer.value
  if (footerEl) {
    const y = footerEl.offsetTop  
    addOutputPort(props.id!, nanoLowercaseAlphanumericId(10), 'pink', y)
  }
 
})
 
const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})
const footer = ref<HTMLElement | null>(null)

const editMode = ref(false)
const title=ref('Text Output')
const description = ref('Display a text output in the Playground.')
</script>

<template>
 
        <Card v-if=" currentNode"   class="w-96 text-white bg-[#18181B]  rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000] text-sm focus:border focus:border-[#27272A]">
          <CardHeader>
            <CardTitle class="text-white flex flex-row  items-center justify-between">  
                <div class="flex flex-row space-x-2 items-center">
                     <div class="bg-[#27272A] rounded-lg p-1  ">
                                <NuxtIcon name="bx:chat" size="20" class="text-white" />
                     </div>
                     <div class="ml-10">
                  
                     <Input v-if="editMode" class="w-60 nodrag nopan" type="text" v-model="title" />
                     <div v-else>{{ title}}</div>
                    </div>
                </div>
            <div  :class="[
    'bg-[#27272A] cursor-pointer transition-all duration-200 rounded-lg p-1',
    editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
  ]" >
                <NuxtIcon @click.stop="editMode=!editMode"  name="iconamoon:edit-light" size="20" class="text-white" />
            </div>
            </CardTitle>
          
            <CardDescription class=" mt-3  p-2 rounded-lg">
                <Input v-if="editMode" class="w-full nodrag nopan text-white" type="text"  placeholder=""  v-model="description"/>
                <div v-else class="text-[#D1D5DB]">{{ description}}</div>
            
            
            </CardDescription>
          </CardHeader>

          <CardContent class="text-white space-y-8  flex-1 ">
            <Separator class="my-1" />
            <div>
                <div class="flex flex-row items-center space-x-2">
                   <p>Text</p> 
                    <NuxtIcon name="clarity:info-line" size="20"  />
                
                </div>
                <div class="w-full  mt-5">
                    <div class="relative">
                        <Input class="w-full" type="text" placeholder="请输入文本" />
                        <NuxtIcon name="solar:full-screen-broken" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
                    </div>
               
            </div>
            </div>
           
          </CardContent>
       
            <div  ref="footer"  class="bg-[#27272A]  rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
                <div class="w-full h-full   flex items-center  justify-between">
                    <NuxtIcon
  v-if="currentNode.data.show"
  name="lets-icons:view-duotone"
  size="24"
  class="cursor-pointer"
  @click="currentNode.data.show = false"
/>

<NuxtIcon
  v-else
  name="lets-icons:view-hide-duotone"
  size="24"
  class="cursor-pointer"
  @click="currentNode.data.show = true"
/>
                      
                    
                     <div class="text-sm">Message</div>
                </div>
                
            </div>
        </Card>
        
 
</template>
