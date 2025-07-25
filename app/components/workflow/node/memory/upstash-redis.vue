<script lang="ts" setup>
import type { UpstashRedisChatMemoryData } from '~~/types/node-data/memory-redis'


import { upstashRedisChatMemoryMeta } from '~~/types/node-data/memory-redis'


const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: UpstashRedisChatMemoryData } | null>(null)




</script>



<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="upstashRedisChatMemoryMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.sessionIdInputVariable" />

        <!-- <div ref="sessionIDVariableRef">
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.sessionIdInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <GlobalVariablePopover v-model:input-variable="currentNode.data.sessionIdInputVariable" />
          </div>
        </div> -->

        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.urlInputVariable" />
        <!-- <div ref="tokenVariableRef">
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.urlInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <GlobalVariablePopover v-bind:input-variable="currentNode.data.urlInputVariable" />
          </div>
        </div> -->
        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.tokenInputVariable" />
        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.tokenInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <GlobalVariablePopover v-model:input-variable="currentNode.data.tokenInputVariable" />

          </div>
        </div> -->
      </template>

      <template #footer v-if="currentNode && currentNode.data">


        <NodeCardOutputFooter v-model:output-variable="currentNode.data.memoryOutputVariable" />


      </template>
    </WorkflowBaseNode>

  </div>
</template>
