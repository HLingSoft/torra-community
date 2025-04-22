<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { until } from '@vueuse/core'
import { nanoid } from 'nanoid'
import FunctionCallSchemaEditor from '~/components/global/function-call-schema-editor.vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '~/stores/workflow'
import { APIInputLangchainName } from '~/types/node-data/api-input'
import type { APIInputData } from '~/types/node-data/api-input'
type KeyValueObject = Record<
  string,
  { name:string,description: string; type: 'string' | 'number' | 'boolean' | 'array' | 'object' }
>
const { currentWorkflow } = storeToRefs(useWorkflowStore())
const open = defineModel<boolean>('open')
const tokenInputRef = ref<{ input: HTMLInputElement } | null>(null)

type KeyValueSchema = Record<
  string,
  {
      name: string
      description: string
      type: string
  }
>

onMounted(async () => {
  await until(currentWorkflow).toBeTruthy()
  if (currentWorkflow.value && !currentWorkflow.value.token) {
    currentWorkflow.value.token = `askpro-${nanoid(32)}`
 
  }
  //找到 workflow 的 nodes 里面有没有APIInputLangchainName的节点，作为 API 的入口
  const apiInputNode = currentWorkflow.value!.nodes.find((node) => {
    return node.data.type === APIInputLangchainName
  })
  if(!apiInputNode) {
    useToast('请先添加 API Input 节点')
    return
  }
  const inputData=(apiInputNode.data as APIInputData).inputData as KeyValueObject || {}
  console.log('inputData', inputData)
  // 如果没有 inputData 就提示
  if (!inputData || Object.keys(inputData).length === 0) {
    useToast('请至少添加一个输入参数')
    return
  }
  console.log('apiInputNode', apiInputNode)

  currentWorkflow.value!.apiSchema = Object.entries(inputData).map(([key, value]) => {
   
    return {
      name: value.name,
      description: value.description,
      type: value.type,
    }
  })
  console.log('currentWorkflow.value!.apiSchema', currentWorkflow.value!.apiSchema)

  await currentWorkflow.value!.save()
})

const { copy } = useClipboard()
const copyToken = () => {
  copy(currentWorkflow.value!.token)
  useToast('Token copied to clipboard')
  const el = tokenInputRef.value?.input
  el?.focus()
  el?.select()
}

const refreshToken = async () => {
  currentWorkflow.value!.token = `askpro-${nanoid(32)}`
  await currentWorkflow.value!.save()
  useToast('Token Refreshed')
  const el = tokenInputRef.value?.input
  el?.focus()
  el?.select()
}

const run = () => {
  // currentWorkflow.value!.save()
  // useToast('API Schema saved')
}
const curlCode = ref('')

 
watch(
  () => [currentWorkflow.value?.apiSchema, currentWorkflow.value?.token],
  ([schemaRaw]) => {
    // console.log('schemaRaw', schemaRaw,currentWorkflow.value?.token)
    const fields = schemaRaw as KeyValueObject || {}
    const jsonBody: Record<string, any> = {}

    for (const [, value] of Object.entries(fields)) {
  const fieldName = value.name || 'field' // 防止空值
  switch (value.type) {
    case 'string':
      jsonBody[fieldName] = 'string'
      break
    case 'number':
      jsonBody[fieldName] ='number'
      break
    case 'boolean':
      jsonBody[fieldName] = 'boolean'
      break
    case 'array':
      jsonBody[fieldName] = []
      break
    case 'object':
      jsonBody[fieldName] = { key: 'value' }
      break
    default:
      jsonBody[fieldName] = null
  }
}


    const prettyJson = JSON.stringify(jsonBody, null, 2)

    curlCode.value = `curl -X POST https://api.allaicg.cn/v1/run \\
-H 'Authorization: Bearer ${currentWorkflow.value?.token}' \\
-H 'Content-Type: application/json' \\
-d '${prettyJson}'`

// console.log('curlCode', curlCode.value)
  },
  
  { deep: true, immediate: true }
)

</script>

<template>
  <Dialog v-model:open="open" class="w-screen">
    <DialogContent v-if="currentWorkflow" class="!max-w-7xl w-screen dark text-white">
      <DialogHeader>
        <DialogTitle>API</DialogTitle>
        <DialogDescription>
          <div class="text-sm text-gray-400">
            Access the workflow through an API, with support for various programming languages.
          </div>
        </DialogDescription>
      </DialogHeader>
      <div class="h-[65vh] flex   overflow-hidden">
        <!-- Left Column -->
        <div class="w-1/2 pr-5  flex flex-col h-full  ">
          <div class="flex flex-col space-y-4 py-4">
            <div class="flex justify-between">
              <div class="flex items-center space-x-2">
                <p>Token</p>
                <NuxtIcon name="clarity:info-line" size="20" />
              </div>
              <div class="flex items-center space-x-2">
                <Button variant="outline" size="sm" class="text-sm" @click="copyToken">
                  <NuxtIcon name="lucide:copy" size="18" />
                </Button>
                <Button variant="outline" size="sm" class="text-sm" @click="refreshToken">
                  <NuxtIcon name="solar:refresh-line-duotone" size="18" />
                </Button>
              </div>
            </div>
            <Input ref="tokenInputRef" id="token" v-model="currentWorkflow.token" class="col-span-3" />
          </div>

          <div class="flex  items-center space-x-2 mb-2">
            <p>Post Body</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>

          <div class="flex-1 overflow-auto pt-5 rounded-md border border-muted p-4">


            <!-- <FunctionCallSchemaEditor v-model="currentWorkflow.apiSchema" /> -->

            <div class="flex-1 overflow-auto ">
      <Table class="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead class="w-[40px]">
              <Checkbox />
            </TableHead>
            <TableHead class="w-40">Name</TableHead>
            <TableHead class="w-96">Value</TableHead>
          
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="(row, index) in currentWorkflow.apiSchema" :key="row.id">
            <TableCell>
              <Checkbox v-model="row.selected" />
            </TableCell>
            <TableCell><Input v-model="row.name" placeholder="Param Name" /></TableCell>
            <TableCell>
              
              <Input v-if="row.type==='string'" v-model="row.value" type="text" placeholder="Param Value" />
              <Input v-if="row.type==='number'" v-model="row.value" type="number" placeholder="Param Value" />
              <div v-if="row.type==='boolean'"  >
                <Select v-model="row.value" placeholder="Param Value">
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent class="dark">
                  <SelectItem value="true">
                   True
                  </SelectItem>
                  <SelectItem value="false">
                   True
                  </SelectItem>
                </SelectContent>
              </Select>  
            
              </div>
            
            
            </TableCell>
            <TableCell>
             
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

          </div>





        </div>

        <!-- Right Column -->
        <div class="w-1/2 pl-5 flex flex-col   min-h-0 ">



          <CodeBlock lang="bash" :code="curlCode" class="h-1/2" />
          <p>Response</p>
          <div class=" min-h-0 mt-3 flex-1 bg-[#1e1e1e]  rounded-md">
            
          </div>


        </div>
      </div>

      <Separator class="my-3" />
      <DialogFooter class="w-full flex justify-between">
        <Button @click="run" variant="destructive"><NuxtIcon name="mynaui:play-solid" size="20"/>Run</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
