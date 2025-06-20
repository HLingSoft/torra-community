<script lang="ts" setup>
import type { OpenAIEmbeddingsData } from '@/types/node-data/openai-embeddings'


import { openAIEmbeddingsMeta } from '@/types/node-data/openai-embeddings'

const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: OpenAIEmbeddingsData } | null>(null)



const models = ref([

  { id: 'text-embedding-3-small', name: 'text-embedding-3-small' },
  { id: 'text-embedding-3-large', name: 'text-embedding-3-large' },
  { id: 'text-embedding-ada-002', name: 'text-embedding-ada-002' },

])
</script>

<template>
  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="openAIEmbeddingsMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">
        <div class="w-full">
          <div class="flex flex-row items-center space-x-2 w-full">
            <p>Model</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full flex items-center justify-between  mt-4">
            <Select v-model="currentNode.data.modelName">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a model name" />
              </SelectTrigger>
              <SelectContent class="w-full dark" teleport="body">
                <SelectGroup>
                  <SelectItem v-for="model in models" :key="model.id" :value="model.id">
                    {{ model.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.apiKeyInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <GlobalVariablePopover v-bind:input-variable="currentNode.data.apiKeyInputVariable" />

          </div>
        </div>

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.baseURLInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <GlobalVariablePopover v-bind:input-variable="currentNode.data.baseURLInputVariable" />
          </div>
        </div>


      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />
      </template>
    </WorkflowBaseNode>
  </div>

</template>
