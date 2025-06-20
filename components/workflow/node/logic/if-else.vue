<script lang="ts" setup>

import type { IfElseData } from '@/types/node-data/if-else'
import { ifElseMeta, MatchType } from '@/types/node-data/if-else'


const props = defineProps<{ id: string }>()
const currentNode = ref<{ id: string, data: IfElseData } | null>(null)




const allOperator = [
  { value: 'equals', label: 'Equals', matchType: MatchType.String },
  { value: 'contains', label: 'Contains', matchType: MatchType.String },
  { value: 'startsWith', label: 'Starts With', matchType: MatchType.String },
  { value: 'endsWith', label: 'Ends With', matchType: MatchType.String },
  { value: 'matches', label: 'Matches', matchType: MatchType.String },
  { value: 'isEmpty', label: 'Is Empty', matchType: MatchType.String },
  { value: 'isNotEmpty', label: 'Is Not Empty', matchType: MatchType.String },
  { value: 'isNull', label: 'Is Null', matchType: MatchType.String },
  { value: 'isNotNull', label: 'Is Not Null', matchType: MatchType.String },
  { value: "true", label: 'Is True', matchType: MatchType.Boolean },
  { value: "false", label: 'Is False', matchType: MatchType.Boolean },

]

const filteredOperators = computed(() => {
  const type = currentNode.value?.data?.matchType
  if (!type) return []
  return allOperator.filter(item => item.matchType === type)
})


</script>




<template>

  <div>
    <WorkflowBaseNode v-model:currentNode="currentNode" :id="props.id" :meta="ifElseMeta" @not-found="() => { }">
      <template #content v-if="currentNode && currentNode.data">

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.textInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <EditTextDialog v-model:input-variable="currentNode.data.textInputVariable" />



          </div>
        </div>
        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>Match Type<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">
            <!-- <div :key="currentNode.id" class="filter dark">
              <input class="btn  btn-sm btn-outline filter-reset bg-card text-white" type="radio" v-model="currentNode.data.matchType" value="All" name="matchType" aria-label="All" />
              <input class="btn btn-sm btn-outline  bg-card text-white" type="radio" value="String" v-model="currentNode.data.matchType" name="matchType" aria-label="String" />
              <input class="btn  btn-sm  btn-outline bg-card text-white" type="radio" value="Boolean" v-model="currentNode.data.matchType" name="matchType" aria-label="Boolean" />

            </div> -->
            <Select v-model="currentNode.data.matchType" class="w-full">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent class="dark" teleport="body">
                <SelectGroup>
                  <SelectItem :value="MatchType.String">文本(String)</SelectItem>

                  <SelectItem :value="MatchType.Boolean">逻辑(Boolean)</SelectItem>

                </SelectGroup>
              </SelectContent>
            </Select>


          </div>
        </div>


        <div v-if="currentNode.data.matchType === MatchType.String">
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.matchTextInputVariable.name }}<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full  mt-5">

            <EditTextDialog v-model:input-variable="currentNode.data.matchTextInputVariable" class="w-full" />

          </div>
        </div>
        <div v-if="currentNode.data.matchType === MatchType.Boolean || currentNode.data.matchType === MatchType.String">
          <div class="flex flex-row items-center space-x-2">
            <p>Operator<span class="text-red-500">*</span></p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>
          <div class="w-full flex items-center    mt-5">
            <Select class="w-full" v-model="currentNode.data.operator">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a operator" />
              </SelectTrigger>
              <SelectContent class="dark max-h-72 overflow-y-auto" teleport="body">
                <SelectGroup>
                  <SelectItem v-for="item in filteredOperators" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div v-if="currentNode.data.matchType === MatchType.String" class="flex flex-row nodrag nopan  items-center justify-between space-x-2 w-full">
          <div class="flex flex-row items-center space-x-2">
            <p>Case Sensitive</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>

          <Switch v-model="currentNode.data!.caseSensitive" />
        </div>

        <div>
          <div class="flex flex-row items-center space-x-2">
            <p>{{ currentNode.data.messageInputVariable.name }}</p>
            <div class="tooltip tooltip-warning" data-tip="附带/携带额外的信息">
              <NuxtIcon name="clarity:info-line" size="20" />
            </div>

          </div>
          <div class="w-full  mt-5">

            <EditTextDialog v-model:input-variable="currentNode.data.messageInputVariable" placeholder="请输入文本" class="w-full" />



          </div>
          <p class="text-xs text-muted-foreground mt-4">*此信息将会作为输出，带给下一个节点</p>
        </div>
      </template>

      <template #footer v-if="currentNode && currentNode.data">


        <div class="flex flex-col space-y-2">
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.falseOutputVariable" class="!rounded-b-none" />
          <NodeCardOutputFooter v-model:output-variable="currentNode.data.trueOutputVariable" />
        </div>

      </template>
    </WorkflowBaseNode>

  </div>
</template>
