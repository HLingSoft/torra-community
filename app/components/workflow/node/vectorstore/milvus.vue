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

        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.collectionNameInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <GlobalVariablePopover v-model:input-variable="currentNode.data.collectionNameInputVariable" />





          </div>
        </div> -->
        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.connectionURIInputVariable" />

        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.connectionURIInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <GlobalVariablePopover v-model:input-variable="currentNode.data.connectionURIInputVariable" />





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

        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.vectorFieldInputVariable" />


        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.vectorFieldInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">



            <GlobalVariablePopover v-model:input-variable="currentNode.data.vectorFieldInputVariable" />



          </div>
        </div> -->


        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.primaryFieldInputVariable" />


        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.primaryFieldInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <GlobalVariablePopover v-model:input-variable="currentNode.data.primaryFieldInputVariable" />




          </div>
        </div> -->
        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.partitionKeyInputVariable" />


        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.partitionKeyInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <GlobalVariablePopover v-model:input-variable="currentNode.data.partitionKeyInputVariable" />

          </div>
        </div> -->


        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.partitionValueInputVariable" />

        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.partitionValueInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <EditTextDialog v-model:input-variable="currentNode.data.partitionValueInputVariable" />

          </div>
        </div> -->
        <GlobalVariablePopoverComponent class="w-full" v-model:inputPortVariable="currentNode.data.textFieldInputVariable" />



        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.textFieldInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">




            <GlobalVariablePopover v-model:input-variable="currentNode.data.textFieldInputVariable" />


          </div>
        </div> -->


        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.searchQueryInputVariable" />


        <!-- <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.searchQueryInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <EditTextDialog v-model:input-variable="currentNode.data.searchQueryInputVariable" />
          </div>
        </div> -->

        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.embeddingInputVariable" :description="`Connect an upstream embedding model to enable vector-based operations.`" :show-input="false" :handleBg="`var(--clr-embed)`" />


        <!-- 
        <div class="relative">
          <div class="  flex w-full flex-row items-center space-x-2">
            <p>{{ currentNode.data.embeddingInputVariable.name }}</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <p class="text-[#D1D5DB] text-sm">Connect an upstream embedding model to enable vector-based operations.</p>
          <div class="w-full  mt-5">

            <EditTextDialog v-model:input-variable="currentNode.data.embeddingInputVariable" :show-input="false" :handleBg="`var(--clr-embed)`" />
          </div>

        </div> -->

        <EditTextDialogComponent class="w-full" v-model:inputPortVariable="currentNode.data.embeddingInputVariable" :show-input="false" :handleBg="`var(--clr-messages)`" />

        <!-- <div class="relative">
          <div class="  flex flex-row w-full  items-center space-x-2">
            <p>{{ currentNode.data.ingestDataInputVariable.name }} </p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <p class="text-[#D1D5DB] text-sm">Ingest data into the vector database</p>
          <div class="w-full  mt-5">

            <EditTextDialog v-model:input-variable="currentNode.data.embeddingInputVariable" :show-input="false" :handleBg="`var(--clr-messages)`" />
          </div>


        </div> -->
      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputPortVariable" />

      </template>
    </WorkflowBaseNode>


  </div>
</template>
