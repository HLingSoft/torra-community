<script lang="ts" setup>
import type { MilvusData } from '@/types/node-data/milvus'
import { milvusMeta } from '@/types/node-data/milvus'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data?: MilvusData }>()

 

const { nodes, edges } = storeToRefs(useWorkflowStore())
const { addInputPort, addOutputPort } = createPortManager()
const { onNodeClick } = useVueFlow()

const collectionNameRef = ref<HTMLElement | null>(null)
const connectionURIRef = ref<HTMLElement | null>(null)
const tokenRef = ref<HTMLElement | null>(null)
const searchQueryRef = ref<HTMLElement | null>(null)
const embeddingRef = ref<HTMLElement | null>(null)
const ingestDataRef = ref<HTMLElement | null>(null)
const resultOutputRef = ref<HTMLElement | null>(null)
const dataframeOutputRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const node = nodes.value.find(n => n.id === props.id)
  if (!node) return

  node.data = {
    ...milvusMeta,
    ...node.data,
  } as MilvusData

  currentNode.value = node

  await nextTick()

  const data = currentNode.value.data!
  const id = props.id
  if(collectionNameRef.value && !data.saved) {
    data.collectionNameVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(id, data.collectionNameVariable.id, 'aquamarine', collectionNameRef.value.offsetTop + collectionNameRef.value.clientHeight / 2)
  }
  if(connectionURIRef.value && !data.saved) {
    data.connectionURIVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(id, data.connectionURIVariable.id, 'aquamarine', connectionURIRef.value.offsetTop + connectionURIRef.value.clientHeight / 2)
  }
  if(tokenRef.value && !data.saved) {
    data.tokenVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(id, data.tokenVariable.id, 'aquamarine', tokenRef.value.offsetTop + tokenRef.value.clientHeight / 2)
  }
  if(searchQueryRef.value && !data.saved) {
    data.searchQueryVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(id, data.searchQueryVariable.id, 'aquamarine', searchQueryRef.value.offsetTop + searchQueryRef.value.clientHeight / 2)
  }
  if(embeddingRef.value && !data.saved) {
    data.embeddingVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(id, data.embeddingVariable.id, 'amber', embeddingRef.value.offsetTop + embeddingRef.value.clientHeight / 2)
  }
  if(ingestDataRef.value && !data.saved) {
    data.ingestDataVariable.id = nanoLowercaseAlphanumericId(10)
    addInputPort(id, data.ingestDataVariable.id, 'yellow', ingestDataRef.value.offsetTop + ingestDataRef.value.clientHeight / 2)
  }
  if(resultOutputRef.value && !data.saved) {
    data.resultOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(id, data.resultOutputVariable.id, 'pink', resultOutputRef.value.offsetTop + 20)
  }
  if(dataframeOutputRef.value && !data.saved) {
    data.dataframeOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(id, data.dataframeOutputVariable.id, 'pink', dataframeOutputRef.value.offsetTop + 20)
  }
 
})

onNodeClick(event => {
  console.log('Clicked node:', event.node.id)
})
watch(edges, () => {
  if (!currentNode.value?.data) return
  const data = currentNode.value.data

  data.collectionNameVariable.connected = edges.value.some(edge => edge.target === data.collectionNameVariable.id)
  data.connectionURIVariable.connected = edges.value.some(edge => edge.target === data.connectionURIVariable.id)
  data.tokenVariable.connected = edges.value.some(edge => edge.target === data.tokenVariable.id)
  data.searchQueryVariable.connected = edges.value.some(edge => edge.target === data.searchQueryVariable.id)
  data.embeddingVariable.connected = edges.value.some(edge => edge.target === data.embeddingVariable.id)
  data.ingestDataVariable.connected = edges.value.some(edge => edge.target === data.ingestDataVariable.id)
  if( data.ingestDataVariable.connected) {
    data.enableIngest = true
  } else {
    data.enableIngest = false
  }
}, { deep: true, immediate: true })
</script>

<template>
  <Card v-if="currentNode && currentNode.data" class="!pb-0 w-96 text-white bg-[#18181B]  rounded-lg  flex flex-col focus:outline-none  focus:shadow-lg focus:shadow-[#000000]   focus:border focus:border-[#27272A]">
    <NodeCardHeader :nodeData="currentNode.data" :id="props.id" />
    <CardContent class="text-white space-y-8 -mt-8  flex-1 nodrag nopan cursor-auto ">
      <Separator class="my-5" />
     
      <div ref="collectionNameRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Collection Name</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.collectionNameVariable.connected" class="relative">
            <Input v-model="currentNode.data.collectionNameVariable.value" class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>

      <div ref="connectionURIRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Connection URI</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.connectionURIVariable.connected" class="relative">
            <Input v-model="currentNode.data.connectionURIVariable.value" class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>


      <div ref="tokenRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Token</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.tokenVariable.connected" class="relative">
            <Input v-model="currentNode.data.tokenVariable.value" class="w-full" type="text" placeholder="如果不需要 Token,则无需填写" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>


      <div ref="tokenRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Vector Field</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.vectorFieldVariable.connected" class="relative">
            <Input v-model="currentNode.data.vectorFieldVariable.value" class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>


      <div ref="tokenRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Primary Field</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.primaryFieldVariable.connected" class="relative">
            <Input v-model="currentNode.data.primaryFieldVariable.value" class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>




      <div ref="tokenRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Text Field</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <div v-if="!currentNode.data.textFieldVariable.connected" class="relative">
            <Input v-model="currentNode.data.textFieldVariable.value" class="w-full" type="text" placeholder="" />
            <NuxtIcon name="solar:global-line-duotone" size="18" class=" absolute z-10 right-2 bottom-2.5 cursor-pointer" />
          </div>
          <div v-else>
            <Input disabled class="w-full" type="text" placeholder="Receiving input" />
          </div>
        </div>
      </div>



      <div ref="searchQueryRef">
        <div class="flex flex-row items-center space-x-2">
          <p>Search Query</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        <div class="w-full  mt-5">
          <EditTextDialog class="w-full" :disabled="currentNode.data.searchQueryVariable.connected" :model-value="currentNode.data.searchQueryVariable.value || ''" placeholder="Typing something" @save="(val) => currentNode!.data!.searchQueryVariable.value = val" />
        </div>
      </div>

    
      <div ref="embeddingRef">
        <div class="flex w-full flex-row items-center space-x-2">
          <p>Embedding</p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
       
      </div>

    
      <div ref="ingestDataRef">
        <div class="flex flex-row w-full  items-center space-x-2">
          <p>Ingest Data </p>
          <NuxtIcon name="clarity:info-line" size="20" />
        </div>
        
        <div>
          <div>
        <!-- <div class="flex items-center justify-between">
          <Label>Enable Ingest</Label>
          <Switch v-model="currentNode.data.enableIngest" />
        </div> -->
      </div>

        </div>
      </div>
    </CardContent>
    <div ref="resultOutputRef" class="bg-[#27272A]   py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.resultOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.resultOutputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.resultOutputVariable.show = true" />

        <div class="  ">
          Search Results
        </div>
      </div>
    </div>
    <div ref="dataframeOutputRef" class="bg-[#27272A]   -mt-2 rounded-b-lg py-2 pl-5 pr-10  flex items-center justify-center">
      <div class="w-full h-full   flex items-center  justify-between">
        <NuxtIcon v-if="currentNode.data.dataframeOutputVariable.show" name="lets-icons:view-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataframeOutputVariable.show = false" />

        <NuxtIcon v-else name="lets-icons:view-hide-duotone" size="24" class="cursor-pointer" @click="currentNode.data.dataframeOutputVariable.show = true" />

        <div class="">
          DataFrame
        </div>
      </div>
    </div>
    
  </Card>
</template>
