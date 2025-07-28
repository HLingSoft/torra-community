<script lang="ts" setup>
import type { MilvusData } from '~~/types/node-data/milvus'
import { milvusMeta } from '~~/types/node-data/milvus'


const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: MilvusData } | null>(null)



</script>



<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="milvusMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">
        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.collectionNameInputVariable" />


        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.connectionURIInputVariable" />


        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.tokenInputVariable" />


        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.vectorFieldInputVariable" />



        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.primaryFieldInputVariable" />


        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.partitionKeyInputVariable" />


        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.partitionValueInputVariable" />

        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.textFieldInputVariable" />




        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.searchQueryInputVariable" />



        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.embeddingInputVariable" :description="`Connect an upstream embedding model to enable vector-based operations.`" :show-input="false" :handleBg="`var(--clr-embed)`" />

        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.embeddingInputVariable" :show-input="false" :handleBg="`var(--clr-messages)`" />

      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputPortVariable" />

      </template>
    </WorkflowBaseNode>


  </div>
</template>
