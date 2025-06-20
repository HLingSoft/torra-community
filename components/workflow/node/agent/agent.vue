<script lang="ts" setup>
import type { AgentData } from '@/types/node-data/agent'
import { agentMeta } from '@/types/node-data/agent'

const props = defineProps<{ id: string }>()

const currentNode = ref<{ id: string, data: AgentData } | null>(null)
const llms = [

  { id: 'gpt-4o-mini', name: 'gpt-4o-mini' },
  { id: 'gpt-4o', name: 'gpt-4o' },
  { id: 'gpt-4', name: 'gpt-4' },
  { id: 'gpt-4.1', name: 'gpt-4.1' },
  { id: 'o3', name: 'o3' },
]

</script>

<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="agentMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">



        <div class="flex flex-col space-y-8">
          <div class="w-full">
            <div class="flex flex-row items-center space-x-2 w-full">
              <p>Model Name</p>
              <NuxtIcon name="clarity:info-line" size="20" />
            </div>
            <div class="w-full flex items-center justify-between  mt-4">
              <Select v-model="currentNode.data.modelName" class="w-full">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a model name" />
                </SelectTrigger>
                <SelectContent class="w-full dark" teleport="body">
                  <SelectGroup>
                    <SelectItem v-for="llm in llms" :key="llm.id" :value="llm.id">
                      {{ llm.name }}
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
              <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.apiKeyInputVariable" />

            </div>
          </div>
          <div>
            <div class="flex flex-row items-center space-x-2">
              <p>{{ currentNode.data.baseURLInputVariable.name }}<span class="text-red-500">*</span></p>
              <NuxtIcon name="clarity:info-line" size="20" />
            </div>
            <div class="w-full  mt-5">

              <GlobalVariablePopover class="w-full" v-model:inputVariable="currentNode.data.baseURLInputVariable" />


            </div>

          </div>

          <div>
            <div class="flex flex-row items-center space-x-2">
              <p>{{ currentNode.data.instructionInputVariable.name }}</p>
              <NuxtIcon name="clarity:info-line" size="20" />
            </div>
            <div class="w-full  mt-5">

              <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.instructionInputVariable" />
            </div>
          </div>

          <div>
            <div class="flex flex-row items-center space-x-2">
              <p>{{ currentNode.data.inputInputVariable.name }}</p>
              <NuxtIcon name="clarity:info-line" size="20" />
            </div>
            <div class="w-full  mt-5">
              <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.inputInputVariable" />

            </div>
          </div>

          <div>
            <div class="flex flex-row items-center space-x-2">
              <p>{{ currentNode.data.historyMessageInputVariable.name }}</p>
              <NuxtIcon name="clarity:info-line" size="20" />
            </div>
            <div class="w-full  mt-5">
              <EditTextDialog class="w-full" v-model:inputVariable="currentNode.data.historyMessageInputVariable" :show-input="false" :handle-bg="`oklch(82.3% 0.12 346.018)`" />
            </div>
          </div>
          <div class="relative">
            <div class="  flex flex-row w-full  items-center space-x-2">
              <p>{{ currentNode.data.toolsInputVariable.name }} </p>
              <NuxtIcon name="clarity:info-line" size="20" />
            </div>
            <p class="text-[#D1D5DB] text-sm"></p>
            <div class="mt-5 w-full">
              <EditTextDialog v-model:input-variable="currentNode.data.toolsInputVariable" :show-input="false" :handleBg="`yellow`" />
            </div>

          </div>

        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">
        <NodeCardOutputFooter v-model:output-variable="currentNode.data.outputVariable" />
      </template>
    </WorkflowBaseNode>
  </div>
</template>
