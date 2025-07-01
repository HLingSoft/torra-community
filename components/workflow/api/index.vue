<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { until } from '@vueuse/core'
import { nanoid } from 'nanoid'
// import { promiseTimeout } from '@vueuse/core'
// import FunctionCallSchemaEditor from '~/components/global/function-call-schema-editor.vue'
import { storeToRefs } from 'pinia'
import { useWorkflowStore } from '~/stores/workflow'
import { APIInputLangchainName } from '~/types/node-data/api-input'
import type { KeyValueSchema } from '~/types/workflow'
import type { APIInputData } from '~/types/node-data/api-input'
import Workflow from '~/models/Workflow'
import WorkflowRunLog from '~/models/WorkflowRunLog'
const { setExecutionTime } = useNodeExecutionStats()
const { currentWorkflow, executionErrorNodeIds } = storeToRefs(useWorkflowStore())
const open = defineModel<boolean>('open')
const tokenInputRef = ref<{ input: HTMLInputElement } | null>(null)
const { user } = storeToRefs(useUserStore())

interface APISchemaField {
  name: string
  description: string
  type: string
  value?: any
}
function formatStepLabel(step: { elapsed: number }, showTimeIcon = false) {
  const { elapsed } = step;

  // -1 ⇒ Pending，-2 ⇒ Skipped
  if (elapsed === -1) return '<span style="color: orange;">Pending</span>';
  if (elapsed === -2) return '<span style="color: red;">Skipped</span>';

  // ① 至少 0.1，② 保留 2 位小数并去掉多余 0
  const val = Math.max(elapsed, 0.1);
  const display = parseFloat(val.toFixed(2));  // 例：1.00 → 1，1.20 → 1.2

  return `<span style="color:#4ade80;">${showTimeIcon ? '⏱️ 耗时：' : ''}${display}ms</span>`;
}
onMounted(async () => {
  await until(currentWorkflow).toBeTruthy()
  if (currentWorkflow.value && !currentWorkflow.value.token) {
    currentWorkflow.value.token = `torra-${nanoid(32)}`

  }
  //找到 workflow 的 nodes 里面有没有APIInputLangchainName的节点，作为 API 的入口
  const apiInputNode = currentWorkflow.value!.nodes.find((node) => {

    return node.data.type === APIInputLangchainName
  })
  if (!apiInputNode) {
    useToast('请先添加 API Input 节点')
    return
  }
  const inputValue = (apiInputNode.data as APIInputData).inputValue as KeyValueSchema || {}


  // 如果没有 inputValue 就提示
  if (!inputValue || Object.keys(inputValue).length === 0) {
    useToast('请至少添加一个输入参数')
    return
  }
  const apiSchema: Record<string, any> = {}
  Object.entries(inputValue).forEach(([key, value]) => {
    apiSchema[key] = {
      name: value.name,
      description: value.description,
      type: value.type,
      defaultValue: value.defaultValue,
      // 优先已有 value，没有则用 defaultValue
      value: value.value !== undefined ? value.value : value.defaultValue,
    }
  })
  currentWorkflow.value!.apiSchema = apiSchema

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
  const confirmed = await useConfirm({
    title: '提示',
    description: '刷新 Token 会导致当前 Token 失效，是否继续？',
    confirmText: '刷新',
    cancelText: '取消',
  })

  if (confirmed) {
    // 执行退出逻辑
    currentWorkflow.value!.token = `torra-${nanoid(32)}`
    await currentWorkflow.value!.save()
    useToast('Token Refreshed')
    const el = tokenInputRef.value?.input
    el?.focus()
    el?.select()
  }


}


const curlCode = ref('')


watch(
  () => [currentWorkflow.value?.apiSchema, currentWorkflow.value?.token],
  ([schemaRaw]) => {

    const fields = schemaRaw as KeyValueSchema || {}
    const jsonBody: Record<string, any> = {}
    for (const [, v] of Object.entries(fields)) {
      const fieldName = v.name
      // 用 value，没填则用 defaultValue
      const fieldValue = v.value !== undefined && v.value !== null && v.value !== ''
        ? v.value
        : v.defaultValue
      jsonBody[fieldName] = fieldValue
    }


    const prettyJson = JSON.stringify(jsonBody, null, 2)

    curlCode.value = `curl -X POST http://localhost:3000/api/v1/run \\
-H 'Authorization: Bearer ${currentWorkflow.value?.token}' \\
-H 'X-User-ID:${user.value?.objectId}' \\
-H 'Content-Type: application/json' \\
-d '${prettyJson}'`


  },

  { deep: true, immediate: true }
)

const runResult = ref('')
const isRunning = ref(false)
const executionTime = ref('')
const run = async () => {
  try {
    const token = currentWorkflow.value?.token
    const schema = currentWorkflow.value?.apiSchema || {}

    const requestBody: Record<string, any> = {}

    for (const param of Object.values(schema) as APISchemaField[]) {
      if (param.name && param.value !== undefined) {
        requestBody[param.name] = param.value
      }
    }


    isRunning.value = true
    runResult.value = ''
    executionTime.value = '' // ⏱️ 清空时间显示

    const startTime = Date.now()

    const res = await fetch('/api/v1/run', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-User-ID': `${user.value?.objectId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: currentWorkflow.value?.toJSON(),
        input: requestBody,
      }),
    })

    const endTime = Date.now()
    const durationMs = endTime - startTime

    // ⏱️ 格式化时间为 X分X秒
    const seconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    executionTime.value = minutes > 0
      ? `${minutes}分${remainingSeconds}秒`
      : `${seconds}秒`

    const json = await res.json()

    if (!res.ok) {
      runResult.value = `❌ API执行失败：${json.error || '未知错误'}`
      return
    }
    if (json.statusCode === 200) {

      const workflowRunLog = new WorkflowRunLog()
      workflowRunLog.workflow = currentWorkflow.value
      workflowRunLog.name = currentWorkflow.value?.name || '工作流运行日志'
      workflowRunLog.logs = json.logs;
      workflowRunLog.channel = 'api'
      workflowRunLog.result = json.output
      workflowRunLog.times = json.logs.reduce((sum, log) => {
        let elapsed = log.elapsed
        if (elapsed > 0) {
          return sum + elapsed
        }
        return sum
      }, 0)
      await workflowRunLog.save()

      runResult.value = json.output
      // 批量渲染统计面板
      if (json.logs && Array.isArray(json.logs)) {
        for (const log of json.logs) {
          setExecutionTime(log.nodeId, formatStepLabel(log, true))
        }
      }
    } else {

      runResult.value = json.output
      // 批量渲染统计面板
      if (json.logs && Array.isArray(json.logs)) {
        for (const log of json.logs) {
          setExecutionTime(log.nodeId, formatStepLabel(log, true))
        }
      }
      if (json.errorNodeId) {
        // 如果有错误节点ID，添加到执行错误节点列表
        if (!executionErrorNodeIds.value.includes(json.errorNodeId)) {
          executionErrorNodeIds.value.push(json.errorNodeId)
        }
      }

    }



  } catch (err) {
    console.error('请求失败', err)
    runResult.value = '请求失败'
  } finally {
    isRunning.value = false
  }
}

</script>

<template>
  <Dialog v-model:open="open" class="w-screen">
    <DialogContent @interact-outside.prevent @pointer-down-outside.prevent @focus-outside.prevent v-if="currentWorkflow" class="!max-w-7xl w-screen dark text-white">
      <DialogHeader>
        <DialogTitle>API</DialogTitle>
        <DialogDescription>
          <div class="text-sm text-gray-400">
            Access the workflow through an API, with support for various programming languages.
          </div>
        </DialogDescription>
      </DialogHeader>
      <div class="h-[65vh] flex  transition-all duration-300 overflow-hidden">
        <!-- Left Column -->
        <div class="w-1/2 pr-5  flex flex-col h-full  ">
          <div class="flex flex-col space-y-4 py-4">
            <div class="flex justify-between">
              <div class="flex items-center space-x-2">
                <p>Token</p>
                <NuxtIcon name="clarity:info-line" size="20" />
              </div>
              <div class="flex items-center space-x-2">
                <Button :disabled="isRunning" variant="outline" size="sm" class="text-sm" @click="copyToken">
                  <NuxtIcon name="lucide:copy" size="18" />
                </Button>
                <Button :disabled="isRunning" variant="outline" size="sm" class="text-sm" @click="refreshToken">
                  <NuxtIcon name="solar:refresh-line-duotone" size="18" />
                </Button>
              </div>
            </div>
            <Input :disabled="isRunning" ref="tokenInputRef" id="token" v-model="currentWorkflow.token" class="col-span-3" />
          </div>

          <div class="flex  items-center space-x-2 mb-4">
            <p>Post Body</p>
            <NuxtIcon name="clarity:info-line" size="20" />
          </div>

          <div class="flex-1 overflow-auto pt-5 rounded-md border border-muted p-4">




            <div class="flex-1 overflow-auto  ">
              <Table :class="{ 'opacity-35 cursor-none': isRunning }" v-if="currentWorkflow.apiSchema && Object.keys(currentWorkflow.apiSchema).length > 0" class="min-w-full">
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

                      <Input v-if="row.type === 'string'" v-model="row.value" type="text" placeholder="Param Value" />
                      <Input v-if="row.type === 'number'" v-model="row.value" type="number" placeholder="Param Value" />
                      <div v-if="row.type === 'boolean'">
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
                      <div v-if="row.type === 'array'">
                        <TagsInput v-model="row.value">
                          <TagsInputItem v-for="item in row.value" :key="item" :value="item">
                            <TagsInputItemText class="truncate max-w-[160px] whitespace-nowrap">
                              {{ item }}
                            </TagsInputItemText>
                            <TagsInputItemDelete />
                          </TagsInputItem>
                          <TagsInputInput placeholder="按回车确认" />
                        </TagsInput>
                      </div>
                    </TableCell>
                    <TableCell>

                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div v-else class="text-muted-foreground text-sm">
                请先添加 API Input 节点，然后在节点中添加输入参数，最后在这里设置参数值。
              </div>
            </div>

          </div>





        </div>

        <!-- Right Column -->
        <div class="w-1/2 pl-5 flex flex-col   min-h-0 ">



          <CodeBlock lang="bash" :code="curlCode" class="h-1/2" />
          <div class="flex flex-row items-center space-x-4 ">
            <p>Response</p>
            <div v-if="isRunning" class=" inline-grid *:[grid-area:1/1]">
              <div class="status status-error animate-ping"></div>
              <div class="status status-error"></div>
            </div>

            <div v-if="!isRunning && executionTime" class=" text-sm text-green-300 font-mono">
              ⏱️ 耗时：{{ executionTime }}
            </div>


          </div>
          <ScrollArea class="flex-1 min-h-0 max-w-2xl overflow-auto">

            <MDC :value="runResult" class=" prose  mt-3 p-4 text-sm flex-1 bg-[#1e1e1e]   rounded-md">

            </MDC>
          </ScrollArea>

        </div>
      </div>

      <Separator class="my-3" />
      <DialogFooter class="w-full flex justify-between">
        <Button :disabled="isRunning" @click="run" variant="destructive">
          <NuxtIcon name="mynaui:play-solid" size="20" />Run
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
