<script lang="ts" setup>
import type { MilvusData } from '@/types/node-data/milvus'
import { milvusMeta } from '@/types/node-data/milvus'
import { createPortManager } from '@/components/workflow/useNodePorts'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data?: MilvusData }>()

const refs = {
  collectionNameRef: ref<HTMLElement | null>(null),
  connectionURIRef: ref<HTMLElement | null>(null),
  tokenRef: ref<HTMLElement | null>(null),
  searchQueryRef: ref<HTMLElement | null>(null),
  embeddingRef: ref<HTMLElement | null>(null),
  ingestDataRef: ref<HTMLElement | null>(null),
  resultOutputRef: ref<HTMLElement | null>(null),
  dataframeOutputRef: ref<HTMLElement | null>(null),
}

const { nodes, edges } = storeToRefs(useWorkflowStore())
const { addInputPort, addOutputPort } = createPortManager()
const { onNodeClick } = useVueFlow()

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

  const portDefs = [
    { ref: refs.collectionNameRef, variable: data.collectionNameVariable },
    { ref: refs.connectionURIRef, variable: data.connectionURIVariable },
    { ref: refs.tokenRef, variable: data.tokenVariable },
    { ref: refs.searchQueryRef, variable: data.searchQueryVariable },
    { ref: refs.embeddingRef, variable: data.embeddingVariable },
    { ref: refs.ingestDataRef, variable: data.ingestDataVariable },
  ]

  for (const { ref, variable } of portDefs) {
    if (ref.value && !data.saved) {
      variable.id = nanoLowercaseAlphanumericId(10)
      addInputPort(id, variable.id, 'aquamarine', ref.value.offsetTop + ref.value.clientHeight / 2)
    }
  }

  if (refs.resultOutputRef.value && !data.saved) {
    data.resultOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(id, data.resultOutputVariable.id, 'pink', refs.resultOutputRef.value.offsetTop + 20)
  }
  if (refs.dataframeOutputRef.value && !data.saved) {
    data.dataframeOutputVariable.id = nanoLowercaseAlphanumericId(10)
    addOutputPort(id, data.dataframeOutputVariable.id, 'pink', refs.dataframeOutputRef.value.offsetTop + 20)
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
          <p>Input</p>
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
        <Label>Connection URI</Label>
        <Input v-model="currentNode.data.connectionURIVariable.value" placeholder="Milvus server URL" />
      </div>

      <div ref="tokenRef">
        <Label>Token</Label>
        <Input v-model="currentNode.data.tokenVariable.value" placeholder="API token" />
      </div>

      <div>
        <Label>Vector Field</Label>
        <Input v-model="currentNode.data.vectorFieldVariable.value" placeholder="vector" />
      </div>

      <div>
        <Label>Primary Field</Label>
        <Input v-model="currentNode.data.primaryFieldVariable.value" placeholder="pk" />
      </div>

      <div>
        <Label>Text Field</Label>
        <Input v-model="currentNode.data.textFieldVariable.value" placeholder="text" />
      </div>

      <div ref="searchQueryRef">
        <Label>Search Query</Label>
        <Input v-model="currentNode.data.searchQueryVariable.value" placeholder="Search text..." />
      </div>

      <div ref="embeddingRef">
        <Label>Embedding</Label>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <Label>Enable Ingest</Label>
          <Switch v-model="currentNode.data.enableIngest" />
        </div>
      </div>

      <div ref="ingestDataRef">
        <Label>Ingest Data (JSON)</Label>
        <Textarea v-model="currentNode.data.ingestDataVariable.value" placeholder='[{ "pageContent": "xxx", "metadata": {} }]' />
      </div>
    </CardContent>

    <div ref="resultOutputRef" class="bg-[#27272A] p-3 flex justify-between items-center">
      <span>Search Results</span>
    </div>
    <div ref="dataframeOutputRef" class="bg-[#27272A] p-3 flex justify-between items-center rounded-b-lg">
      <span>DataFrame</span>
    </div>
  </Card>
</template>
