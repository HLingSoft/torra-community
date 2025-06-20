<script lang="ts" setup>
import type { MCPHttpData } from '@/types/node-data/mcp-http'


import { mcpHttpMeta } from '@/types/node-data/mcp-http'


const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: MCPHttpData } | null>(null)




</script>


<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="mcpHttpMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.urlInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <GlobalVariablePopover v-model:input-variable="currentNode.data.urlInputVariable" />

          </div>
        </div>

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.tokenInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <GlobalVariablePopover v-model:input-variable="currentNode.data.tokenInputVariable" />

          </div>
        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">


        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />


      </template>
    </WorkflowBaseNode>

  </div>
</template>
