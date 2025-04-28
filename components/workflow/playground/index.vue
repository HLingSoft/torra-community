<script setup lang="ts">
import type Workflow from '~/models/Workflow'
import type { ServerMessage } from '~/types/ws'
import { Button } from '~/components/ui/button'
import { ref } from 'vue'
import { ChatInputLangchainName } from '~/types/node-data/chat-input'
const props = defineProps<{ workflow: Workflow }>()
const { setExecutionTime } = useNodeExecutionStats()
const { currentWorkflow } = storeToRefs(useWorkflowStore())
const canUsePlayground = ref(false)
function formatStepLabel(step: any, showTimeIcon: boolean) {
  if (step.elapsed === -1) {
    return '<span style="color: orange;">Pending</span>'
  } else if (step.elapsed === -2) {
    return '<span style="color: red;">Skipped</span>'
  } else {
    return `<span style="color: #4ade80;">${showTimeIcon ? '⏱️ 耗时：' : ''}${step.elapsedStr}</span>`  // Tailwind绿色 #4ade80
  }
}
onMounted(async () => {
  await until(currentWorkflow).toBeTruthy()

  //找到 workflow 的 nodes 里面有没有APIInputLangchainName的节点，作为 API 的入口
  const apiInputNode = currentWorkflow.value!.nodes.find((node) => {
    return node.data.type === ChatInputLangchainName
  })
  if (!apiInputNode) {
    useToast('请先添加 Chat Input 节点')
    canUsePlayground.value = false
  } else {
    canUsePlayground.value = true
  }

  if (canUsePlayground.value) {
    assistantMessages.value.push({
      role: 'ai',
      content: '✅ 你可以开始使用 AI 助手了！',
    })
  } else {
    assistantMessages.value.push({
      role: 'ai',
      content: '❌ 你还不能使用 AI 助手，请先添加 Chat Input 节点',
    })
  }

})

const userInput = ref('')
const messages = ref<Record<string, any>>([
])

const assistantMessages = ref<Record<string, any>>([
  // { role: 'assistant', content: '你好，我是你的 AI 助手。' },
])


// const userScroll = ref<HTMLElement | null>(null)
// const assistantScroll = ref<HTMLElement | null>(null)

// const userBottomRef = ref<HTMLElement | null>(null)
// const assistantBottomRef = ref<HTMLElement | null>(null)

const userScrollRef = ref<HTMLElement | null>(null)
const assistantScrollRef = ref<HTMLElement | null>(null)

function forceScrollToBottom(refEl: Ref<HTMLElement | null>) {
  nextTick(() => {
    setTimeout(() => {
      const el = refEl.value
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    }, 10)
  })
}

watch(messages, () => {
  forceScrollToBottom(userScrollRef)
})

watch(assistantMessages, () => {
  forceScrollToBottom(assistantScrollRef)
})
const isProgress = ref(false)
const isError = ref(false)
let ws: WebSocket | null = null

const sendMessage = () => {
  if (!userInput.value.trim()) {
    return
  }

  const input = userInput.value.trim()
  messages.value.push({ role: 'user', content: input })
  userInput.value = ''
  isProgress.value = true
  isError.value = false

  //开发环境下使用本地 服务器连接
  //生产环境下使用云端 服务器连接

  if (process.env.NODE_ENV === 'production') {
    // ws = new 服务器连接('wss://workflow.allaicg.cn')
    ws = new WebSocket('wss://askpro.aliyun.hlingsoft.com')
  } else {
    ws = new WebSocket('ws://localhost:3001')
  }

  const msgIndexMap = new Map<string, number>()

  ws.onopen = () => {
    console.log('🟢 服务器连接 connected')
    assistantMessages.value = []
    ws?.send(JSON.stringify({
      namespace: 'execute',
      type: 'run',
      workflow: props.workflow,
      input: { message: input },
    }))
    msgIndexMap.clear()
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data) as ServerMessage
    console.log('🟢 服务器连接 message:', msg)

    if (msg.type === 'progress') {
      const step = msg.data
      if (step.index === 1) {
        assistantMessages.value.push({
          role: 'assistant',
          content: '⏳ 正在执行工作流...',
        })
      }



      // const text = `✅ [${step.index}/${step.total}] ${step.type} (${step.nodeId}) — <span style="color: #4ade80">${label}</span>`
      const text = `✅ [${step.index}/${step.total}] ${step.type} (${step.nodeId}) — ${formatStepLabel(step, false)}`

      // 若已存在该 nodeId，对应位置直接替换
      const key = step.nodeId
      if (msgIndexMap.has(key)) {
        assistantMessages.value[msgIndexMap.get(key)!].content = text   // 覆盖
      } else {
        assistantMessages.value.push({ role: 'assistant', content: text })
        msgIndexMap.set(key, assistantMessages.value.length - 1)
      }
      // const label = step.elapsed === -1
      //   ? 'Pending'  // Pending 状态
      //   : step.elapsed === -2
      //     ? 'Skipped'  // Skipped 状态
      //     : step.elapsed === 0
      //       ? '0 ms'  // 特殊处理 0 毫秒
      //       : step.elapsedStr  // 正常的时间字符串（例如 "1.23 ms"）
      // 侧边统计面板
      setExecutionTime(step.nodeId, formatStepLabel(step, true))
      // setExecutionTime(step.nodeId, step.elapsedStr)
    }

    if (msg.type === 'done') {
      assistantMessages.value.push({
        role: 'assistant',
        content: '✅ 工作流执行完成！',
      })
      messages.value.push({
        role: 'ai',
        content: msg.data.output,
      })
      isProgress.value = false
      ws?.close()
    }

    if (msg.type === 'error') {
      assistantMessages.value.push({
        role: 'assistant',
        content: `❌ 执行失败：${msg.message}`,
      })
      isProgress.value = false
      isError.value = true
      ws?.close()
    }
  }

  ws.onerror = (err) => {
    assistantMessages.value.push({
      role: 'assistant',
      content: '❌ 服务器连接 错误',
    })
    isProgress.value = false
    isError.value = true
    console.error('服务器连接 error:', err)
    ws?.close()
  }
}

const stopWS = () => {
  messages.value.push({
    role: 'assistant',
    content: '⛔️ 执行已手动中止',
  })
  isProgress.value = false
  ws?.close()
}
</script>

<template>
  <div class="  grid grid-rows-[1fr_auto] h-full ">
    <div class="flex flex-row overflow-hidden ">
      <div class="w-1/2 flex flex-col  ">
        <ScrollArea class="flex-1 overflow-y-auto p-4 text-white" ref="userScrollRef">
          <div class="space-y-4">
            <div v-for="(msg, index) in messages" :key="index" class="flex flex-row items-start gap-3">
              <Avatar>
                <AvatarFallback>{{ msg.role === 'user' ? 'U' : index + 1 }}</AvatarFallback>
              </Avatar>
              <MDC :value="msg.content" class="rounded-xl p-3 bg-muted prose   text-white">
              </MDC>
            </div>
            <div v-if="isProgress" class="flex flex-row items-start gap-3">
              <Avatar>
                <AvatarFallback>
                  <div class=" inline-grid *:[grid-area:1/1]">
                    <div class="status status-error animate-ping"></div>
                    <div class="status status-error"></div>
                  </div>
                </AvatarFallback>
              </Avatar>

            </div>
          </div>
          <div ref="userBottomRef" />
        </ScrollArea>


      </div>
      <div class="w-1/2 pl-10 flex flex-col   bg-background">
        <ScrollArea class="flex-1 overflow-y-auto p-4 text-white" ref="assistantScrollRef">
          <div class="space-y-4">
            <div v-for="(msg, index) in assistantMessages" :key="index" class="flex flex-row items-start gap-3">

              <MDC :value="msg.content" class="rounded-xl p-3 bg-muted prose   text-white">
              </MDC>
            </div>

          </div>
          <div ref="assistantBottomRef" />
        </ScrollArea>
      </div>
    </div>

    <footer class="shrink-0 p-4">
      <div class="flex relative items-end bg-background rounded-2xl px-4 py-3 shadow-sm w-full gap-3">
        <Textarea v-model="userInput" :disabled="isProgress || !canUsePlayground" placeholder="输入内容..." class="flex-1 resize-none" @keydown.enter.prevent="sendMessage" />


        <Button v-if="!isProgress" :disabled="!userInput || !canUsePlayground" class="rounded-full p-2 absolute bottom-6 right-6" @click="sendMessage">
          <NuxtIcon name="lucide:arrow-up" size="19" />
        </Button>
        <Button v-else class="rounded-full p-2 absolute bottom-6 right-6" @click="stopWS">
          <NuxtIcon name="material-symbols-light:stop-rounded" size="19" />
        </Button>
      </div>
    </footer>
  </div>
</template>
