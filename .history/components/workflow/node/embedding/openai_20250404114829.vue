<script lang="ts" setup>
import { createPortManager } from '@components/workflow/useNodePorts'

import { useVueFlow } from '@vue-flow/core'
import { promiseTimeout } from '@vueuse/core'

//  import { Handle,Position } from '@vue-flow/core'

// 引入公共样式
const props = defineProps({
  id: String,

})
const currentNode = ref()
const { addInputPort, addOutputPort } = createPortManager()
const openaiAPIKeyRef = ref<HTMLElement | null>(null)
const footer = ref<HTMLElement | null>(null)
const { nodes } = storeToRefs(useWorkflowStore())
onMounted(async () => {
  currentNode.value = nodes.value.find(node => node.id === props.id)
  await nextTick() // 等待 DOM 渲染完毕
  await promiseTimeout(100) // 等待 DOM 渲染完毕
  if (openaiAPIKeyRef.value) {
    addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', openaiAPIKeyRef.value.offsetTop + openaiAPIKeyRef.value.clientHeight / 2)
  }
  if (footer.value) {
    addOutputPort(props.id!, nanoLowercaseAlphanumericId(10), 'pink', footer.value.offsetTop + footer.value.clientHeight / 2)
  }
})

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})

const editMode = ref(false)
const title = ref('OpenAI Embeddings')
const description = ref('Generate embeddings using OpenAI models.')

const llms = ref([

  { id: 'text-embedding-3-large', name: 'text-embedding-3-large' },
  { id: 'text-embedding-3-small', name: 'text-embedding-3-small' },

])
</script>

<template>
  <Card v-if=" currentNode" class="w-96 text-white bg-[#18181B]  rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000] text-sm focus:border focus:border-[#27272A]">
    <CardHeader>
      <CardTitle class="text-white flex flex-row  items-center justify-between">
        <div class="flex flex-row space-x-2 items-center">
          <div class="bg-[#27272A] rounded-lg p-1  ">
            <NuxtIcon name="bx:chat" size="20" class="text-white" />
          </div>
          <div class="ml-10">
            <Input v-if="editMode" v-model="title" class="w-60 nodrag nopan" type="text" />
            <div v-else>
              {{ title }}
            </div>
          </div>
        </div>
        <div
          class="bg-[#27272A] cursor-pointer transition-all duration-200 rounded-lg p-1" :class="[
            editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          ]"
        >
          <NuxtIcon name="iconamoon:edit-light" size="20" class="text-white" @click.stop="editMode = !editMode" />
        </div>
      </CardTitle>

      <CardDescription class=" mt-3  p-2 rounded-lg">
        <Input v-if="editMode" v-model="description" class="w-full nodrag nopan text-white" type="text" placeholder="" />
        <div v-else class="text-[#D1D5DB]">
          {{ description }}
        </div>
      </CardDescription>
    </CardHeader>

    <CardContent class="text-white space-y-8  flex-1 ">
      <Separator class="my-1" />
      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>Model Name</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full flex items-center justify-between  mt-5">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a model name" />
            </SelectTrigger>
            <SelectContent class="dark">
              <SelectGroup>
                <SelectItem v-for="llm in llms" :key="llm.id" :value="llm.id">
                  {{ llm.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div ref="openaiAPIKeyRef">
        <div class="flex flex-row items-center space-x-2">
          <p>OpenAI API Key<span class="text-red-500">*</span></p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>
    </CardContent>

    <div ref="footer" class="bg-[#27272A]  rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
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

        <div class="text-sm">
          Embeddings
        </div>
      </div>
    </div>
  </Card>
</template>
