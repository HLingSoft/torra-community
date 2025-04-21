<script setup lang="ts">
import type Workflow from '~/models/Workflow'
import type { ServerMessage } from '~/types/ws'
import { Button } from '~/components/ui/button'
import { ref } from 'vue'

const props = defineProps<{ workflow: Workflow }>()
const { setExecutionTime } = useNodeExecutionStats()
const userInput = ref('')
const messages = ref([
  { role: 'assistant', content: '你好，我是你的 AI 助手。' },
])

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

  ws = new WebSocket('ws://localhost:3001')

  ws.onopen = () => {
    console.log('🟢 WebSocket connected')
    ws?.send(JSON.stringify({
      namespace: 'execute',
      type: 'run',
      workflow: props.workflow,
      input: { message: input },
    }))
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data) as ServerMessage
    console.log('🟢 WebSocket message:', msg)

    if (msg.type === 'progress') {
      const step = msg.data
      if (step.index === 1) {
        messages.value.push({
          role: 'assistant',
          content: '⏳ 正在执行工作流...',
        })
      }
      messages.value.push({
        role: 'assistant',
        content: `✅ [${step.index}/${step.total}] ${step.type} (${step.nodeId}) 执行完成 耗时 ${step.elapsedStr}`,
      })
      setExecutionTime(step.nodeId, step.elapsedStr)
    }

    if (msg.type === 'done') {
      messages.value.push({
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
      messages.value.push({
        role: 'assistant',
        content: `❌ 执行失败：${msg.message}`,
      })
      isProgress.value = false
      isError.value = true
      ws?.close()
    }
  }

  ws.onerror = (err) => {
    messages.value.push({
      role: 'assistant',
      content: '❌ WebSocket 错误',
    })
    isProgress.value = false
    isError.value = true
    console.error('WebSocket error:', err)
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
  <div class="dark flex flex-col h-full">
    <!-- 顶部导航栏 -->
    <header class="h-14 shrink-0 border-b border-border px-4 flex items-center text-white">
      Workflow Playground
    </header>

    <!-- 聊天区域 -->
    <ScrollArea class="flex-1 overflow-y-auto p-4 text-white">
      <div class="space-y-4">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex flex-row items-start gap-3"
        >
          <Avatar>
            <AvatarFallback>{{ msg.role === 'user' ? 'U' : index + 1 }}</AvatarFallback>
          </Avatar>
          <div class="rounded-xl p-3 bg-muted text-white">
            {{ msg.content }}
          </div>
        </div>
      </div>
    </ScrollArea>

    <!-- 输入框 -->
    <footer class="shrink-0 p-4">
      <div class="flex relative items-end bg-background rounded-2xl px-4 py-3 shadow-sm w-full gap-3">
        <Textarea
          v-model="userInput"
          :disabled="isProgress"
          placeholder="输入内容..."
          class="flex-1 resize-none"
          @keydown.enter.prevent="sendMessage"
        />

        <!-- 按钮切换 -->
        <Button
          v-if="!isProgress"
          :disabled="!userInput"
          class="rounded-full p-2 absolute bottom-6 right-6"
          @click="sendMessage"
        >
          <NuxtIcon name="lucide:arrow-up" size="19" />
        </Button>
        <Button
          v-else
          class="rounded-full p-2 absolute bottom-6 right-6"
          @click="stopWS"
        >
          <NuxtIcon name="material-symbols-light:stop-rounded" size="19" />
        </Button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 你可以加 loading 动画或消息 loading 状态样式 */
</style>
