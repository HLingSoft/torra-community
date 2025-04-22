<script setup lang="ts">
import type Workflow from '~/models/Workflow'
import type { ServerMessage } from '~/types/ws'
import { Button } from '~/components/ui/button'
import { ref } from 'vue'

const props = defineProps<{ workflow: Workflow }>()
const { setExecutionTime } = useNodeExecutionStats()
// const { currentWorkflow } = storeToRefs(useWorkflowStore())
const userInput = ref('')
const messages = ref([
  { role: 'assistant', content: '你好，我是你的 AI 助手。' },
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


  ws.onopen = () => {
    console.log('🟢 服务器连接 connected')
    assistantMessages.value = []
    ws?.send(JSON.stringify({
      namespace: 'execute',
      type: 'run',
      workflow: props.workflow,
      input: { message: input },
    }))
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
      assistantMessages.value.push({
        role: 'assistant',
        content: `✅ [${step.index}/${step.total}] ${step.type} (${step.nodeId}) 执行完成 耗时 ${step.elapsedStr}`,
      })
      setExecutionTime(step.nodeId, step.elapsedStr)
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
        <Textarea v-model="userInput" :disabled="isProgress" placeholder="输入内容..." class="flex-1 resize-none" @keydown.enter.prevent="sendMessage" />


        <Button v-if="!isProgress" :disabled="!userInput" class="rounded-full p-2 absolute bottom-6 right-6" @click="sendMessage">
          <NuxtIcon name="lucide:arrow-up" size="19" />
        </Button>
        <Button v-else class="rounded-full p-2 absolute bottom-6 right-6" @click="stopWS">
          <NuxtIcon name="material-symbols-light:stop-rounded" size="19" />
        </Button>
      </div>
    </footer>
  </div>
</template>
