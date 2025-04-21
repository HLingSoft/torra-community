<script lang="ts" setup>
import { createPortManager } from '~/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'
import { promiseTimeout } from '@vueuse/core'
//  import { Handle,Position } from '@vue-flow/core'

// 引入公共样式
const props = defineProps({
  id: String,

})
const currentNode = ref()

const collectionNameRef = ref<HTMLElement | null>(null)
const collectionDescriptionRef = ref<HTMLElement | null>(null)
const collectionURIRef = ref<HTMLElement | null>(null)
const ingestDataRef = ref<HTMLElement | null>(null)
const searchQueryRef = ref<HTMLElement | null>(null)
const messageRef = ref<HTMLElement | null>(null)
const languageModelRef = ref<HTMLElement | null>(null)

const { addInputPort, addOutputPort } = createPortManager()
const { nodes } = storeToRefs(useWorkflowStore())
onMounted(async () => {
  currentNode.value = nodes.value.find(node => node.id === props.id)
  // console.log('currentNode', currentNode.value)
  // await nextTick() // 等待 DOM 渲染完毕
  // addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'aquamarine', 25)
  await nextTick() // 等待 DOM 渲染完毕
  // ✅ 给每个字段位置添加 Input Port
  await promiseTimeout(100) // 等待 DOM 渲染完毕

  if (ingestDataRef.value) {
    addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'orange', ingestDataRef.value.offsetTop - 10)
  }

  if (searchQueryRef.value) {
    addInputPort(props.id!, nanoLowercaseAlphanumericId(10), 'yellow', searchQueryRef.value.offsetTop - 10)
  }

  // ✅ 添加输出端口，通常靠底部（Message 区域）
  if (messageRef.value) {
    addOutputPort(props.id!, nanoLowercaseAlphanumericId(10), 'pink', messageRef.value.offsetTop + messageRef.value.clientHeight / 2)
  }

  if (languageModelRef.value) {
    addOutputPort(props.id!, nanoLowercaseAlphanumericId(10), 'pink', languageModelRef.value.offsetTop + languageModelRef.value.clientHeight / 2)
  }
})

const { onNodeClick } = useVueFlow()
onNodeClick((event) => {
  console.log('nodeId:', event.node.id)
  console.log('完整事件对象:', event)
})

const editMode = ref(false)
const title = ref('Milvus')
const description = ref('Milvus vector store with search capabilities.')
</script>

<template>
  <Card v-if=" currentNode" class="w-96 text-white bg-[#18181B] text-sm rounded-lg group flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
    <CardHeader class="">
      <CardTitle class="text-white flex flex-row  items-center justify-between">
        <div class="flex drag-header flex-row space-x-2 items-center">
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

    <CardContent class="text-white space-y-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />

      <div ref="collectionNameRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Collection Name</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div ref="collectionDescriptionRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Collection Description</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div ref="collectionURIRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Collection URI</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>Vector Field Name</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div>
        <div class="flex flex-row items-center space-x-2">
          <p>PartitionKey</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>

      <div>
        <Tabs default-value="account">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="account">
              Account
            </TabsTrigger>
            <TabsTrigger value="token">
              Token
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div class="mt-5">
              <div class="flex flex-row items-center space-x-2">
                <p>UserName</p>
                <NuxtIcon name="clarity:info-line" size="20" />
              </div>
              <div class="w-full  mt-5">
                <div class="relative">
                  <Input class="w-full" type="text" placeholder="Typing something" />
                  <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
                </div>
              </div>
            </div>
            <div class="mt-5">
              <div class="flex flex-row items-center space-x-2">
                <p>Password</p>
                <NuxtIcon name="clarity:info-line" size="20" />
              </div>
              <div class="w-full  mt-5">
                <div class="relative">
                  <Input class="w-full" type="text" placeholder="Typing something" />
                  <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="token">
            <div class="mt-5">
              <div class="flex flex-row items-center space-x-2">
                <p>Token</p>
                <NuxtIcon name="clarity:info-line" size="20" />
              </div>
              <div class="w-full  mt-5">
                <div class="relative">
                  <Input class="w-full" type="text" placeholder="Typing something" />
                  <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div ref="ingestDataRef">
        <div class="flex flex-row items-center justify-between space-x-2">
          <div class="flex flex-row items-center space-x-2">
            <p>Ingest Data</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
        </div>
      </div>

      <div ref="searchQueryRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Search Query</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div class="relative">
            <Input class="w-full" type="text" placeholder="Typing something" />
            <NuxtIcon name="solar:full-screen-broken" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
        </div>
      </div>
    </CardContent>

    <div ref="messageRef" class="bg-[#27272A]   py-2 pl-5 pr-10  flex items-center justify-center">
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

        <div class="text-sm  ">
          Message
        </div>
      </div>
    </div>
    <div ref="languageModelRef" class="bg-[#27272A]   mt-2 rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
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
          Language Model
        </div>
      </div>
    </div>
  </Card>
</template>
