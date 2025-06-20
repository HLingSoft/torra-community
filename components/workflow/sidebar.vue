<script setup lang="ts">

const props = defineProps<{ [key: string]: unknown }>()
const searchKeyword = ref('')
const { triggerNodeComponentName, nodes } = storeToRefs(useWorkflowStore())
interface NavItem {
  title: string
  url: string
  description?: string
  component?: string
  isActive?: boolean
  isDisabled?: boolean
}

interface NavGroup {
  title: string
  url: string
  icon?: string
  items: NavItem[]
}
const data = ref<{ navMain: NavGroup[] }>({

  navMain: [
    {
      title: '输入',
      url: '#',
      icon: 'si:input-line',
      items: [
        {
          title: 'Chat Input',
          url: '#',
          component: 'input/chat-input',

          description: `
  ChatInput

- **组件名称**："ChatInput"
- **描述**：
  用于接收用户的聊天输入，适用于对话类应用，通常与 "ChatOutput"、"Agent" 等组件配合使用。
- **功能特点**：
  - 聊天气泡样式
  - 支持多行输入（Shift+Enter 换行）
  - 回车（Enter）自动发送
  - 可绑定至 "Agent" 节点进行实时交互
- **使用场景**：
  - 构建 Chatbot 界面
  - 需要模拟对话交互的输入端

`,
          isActive: false,
          isDisabled: false,
        },
        {
          title: 'Text Input',
          url: '#',
          component: 'input/text-input',
          description: `TextInput

- **组件名称**："TextInput"
- **描述**：
  常规文本输入组件，用于设置参数、填写变量、配置属性，适用于所有非聊天场景。
- **功能特点**：
  - 标准表单风格
  - 支持单行或多行（根据配置）
  - 常用于组件参数设置（如 prompt 模板变量、API Key、路径等）
- **使用场景**：
  - 设置节点参数（如 LLM 的 "temperature"、prompt 变量等）
  - 输入静态值或用户控制项`,
          isActive: false, isDisabled: false,
        },
        {
          title: 'API Input',
          url: '#',
          component: 'input/api-input',
          description: `APIInput
- **组件名称**："APIInput"
- **描述**：
  当前工作流发布为 API 时，接收外部请求的输入组件。适用于需要将工作流作为 API 接口调用的场景。
- **功能特点**：
  - 支持 POST 请求
  - 可配置请求参数、头部信息、请求体等
  - 自动生成 API 文档
`,
          isActive: false,
          isDisabled: false,
        },
      ],
    },
    {
      title: '输出',
      url: '#',
      items: [
        {
          title: 'Chat Output',
          url: '#',
          component: 'output/chat-output',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Text Output',
          url: '#',
          component: 'output/text-output',
          isActive: true,
          description: '',
        },

      ],
    },
    {
      title: '提示词',
      url: '#',
      items: [
        {
          title: 'Prompt',
          url: '#',
          component: 'prompt/prompt',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: 'Image',
      url: '#',
      items: [
        {
          title: 'OpenAI Image Recognition ',
          url: '#',
          component: 'image/recognition-openai',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'OpenAI Image Generate ',
          url: '#',
          component: 'image/generate-openai',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: 'Voice',
      url: '#',
      items: [
        {
          title: 'OpenAI Voice Recognition ',
          url: '#',
          component: 'voice/recognition-openai',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'OpenAI Voice Generate ',
          url: '#',
          component: 'voice/generate-openai',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: '数据源',
      url: '#',
      items: [
        {
          title: 'API Request',
          url: '#',
          component: 'data/api-request',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'API Tool',
          url: '#',
          component: 'data/api-tool',
          isActive: false,
          isDisabled: false,
          description: '',
        },
        {
          title: 'Directory',
          url: '#',
          description: '',
        },
        {
          title: 'File',
          url: '#',
          description: '',
        },
        {
          title: 'MongoDB',
          url: '#',
          description: '',
        },
        {
          title: 'SQL Query',
          url: '#',
          description: '',
        },
        {
          title: 'URL',
          url: '#',
          component: 'data/url',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Webhook',
          url: '#',
          description: '',
        },
      ],
    },
    {
      title: 'Processing',
      url: '#',
      items: [
        {
          title: 'Message to Data',
          url: '#',
          component: 'processing/message-to-data',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Data to Message',
          url: '#',
          component: 'processing/data-to-message',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Filter Data',
          url: '#',
          component: 'processing/filter-data',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Combine Data',
          url: '#',
          component: 'processing/combine-data',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Structured To Data',
          component: 'processing/structured-to-data',
          isActive: false, isDisabled: false,
          url: '#',
          description: '',
        },
        {
          title: 'Data To Structured',
          component: 'processing/data-to-structured',
          isActive: false, isDisabled: false,
          url: '#',
          description: '',
        },
        {
          title: 'JSON Parser',
          url: '#',
          component: 'processing/json-parser',
          description: '',
        },


        {
          title: 'Save File To Aliyun',
          url: '#',

          isActive: false,
          isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: 'Models',
      url: '#',
      items: [
        {
          title: 'Ollama',
          url: '#',

          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Anthropic',
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'DeepSeek',
          url: '#',
          description: '',
        },
        {
          title: 'OpenAI',
          component: 'model/openai',
          url: '#',
          description: '',
        },
        {
          title: 'Google',
          url: '#',
          description: '',
        },

      ],
    },
    {
      title: 'Vector Stores',
      url: '#',
      items: [
        {
          title: 'Milvus',
          url: '#',
          component: 'vectorstore/milvus',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: 'Embeddings',
      url: '#',
      items: [
        {
          title: 'OpenAI',
          component: 'embedding/openai',
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: '对话存储',
      url: '#',
      items: [
        {
          title: 'Upstash Redis Chat Memory',
          url: '#',
          component: 'memory/upstash-redis',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: '智能体',
      url: '#',
      items: [
        {
          title: 'Agent',
          url: '#',
          component: 'agent/agent',
          isActive: false,
          isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: '逻辑',
      url: '#',
      items: [
        {
          title: 'If-Else',
          url: '#',
          component: 'logic/if-else',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Listen',
          url: '#',
          component: 'logic/listen',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Loop',
          url: '#',
          component: 'logic/loop',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Notify',
          url: '#',
          component: 'logic/notify',
          isActive: false,
          isDisabled: false,
          description: '',
        },
        {
          title: 'Pass',
          url: '#',
          component: 'logic/pass',
          isActive: false,
          isDisabled: false,
          description: '',
        },


      ],
    },
    {
      title: '工具',
      url: '#',
      items: [

        {
          title: '百度搜索',
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: '计算器',
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Google 搜索',
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Tavily AI 搜索',
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: '时区/地理位置',
          url: '#',
          component: 'tool/timezone',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: 'Helpers',
      url: '#',
      items: [
        {
          title: 'ID 生成器',
          url: '#',
          component: 'helper/id-generator',
          isActive: false, isDisabled: false,
          description: '',
        },

        {
          title: 'Message History',
          url: '#',
          component: 'helper/message-history',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Message Store',
          url: '#',
          component: 'helper/message-store',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Structured Output',
          url: '#',
          component: 'helper/structured-output',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'List Output',
          url: '#',
          component: 'helper/list-output',
          isActive: false,
          isDisabled: false,
          description: '',
        },



      ]
    },
    {
      title: 'MCP',
      url: '#',
      items: [
        {
          title: 'MCP Tools HTTP',
          url: '#',
          component: 'mcp/http',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'MCP Tools SSE',
          url: '#',
          // component: 'mcp/sse',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'MCP Tools stdio',
          url: '#',
          description: '',
        },

      ],
    },
    {
      title: 'SubFlow',
      url: '#',
      items: [
        {
          title: 'Workflow',
          url: '#',
          component: 'subflow/workflow',
          isActive: false,
          isDisabled: false,
          description: '',
        },


      ],
    },
    {
      title: 'Plugins',
      url: '#',
      items: [


      ],
    },


  ],
})

const filteredNav = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return data.value.navMain

  return data.value.navMain
    .map(group => {
      const groupMatches = group.title.toLowerCase().includes(keyword)

      if (groupMatches) {
        // ✅ 父级 group 匹配，直接返回全部子项
        return group
      }

      // 否则匹配子项 title
      const matchedItems = group.items?.filter(item =>
        item.title.toLowerCase().includes(keyword)
      )

      if (!matchedItems || matchedItems.length === 0) {
        return null
      }

      return {
        ...group,
        items: matchedItems
      }
    })
    .filter(Boolean)
})

const exclusiveInputs = ['input/chat-input', 'input/api-input']

watch(nodes, () => {
  const existingComponents = nodes.value.map(node => node.data.component)

  data.value.navMain
    .flatMap(group => group.items ?? [])
    .filter(item => !!item.component) // 👈 加这行解决报错
    .forEach(item => {
      if (exclusiveInputs.includes(item.component!)) {
        item.isDisabled = existingComponents.includes(item.component!)
      } else {
        item.isDisabled = false
      }
    })
}, { deep: true })

</script>

<template>
  <Sidebar v-bind="props" class="dark   bg-background text-white border-[hsl(var(--border))] ">
    <SidebarHeader>
      <WorkflowWorkspaceSwitcher />
      <WorkflowSearch class="mt-5" v-model="searchKeyword" />
    </SidebarHeader>
    <SidebarContent>
      <ScrollArea>
        <SidebarGroup v-for="item in filteredNav" :key="item!.title">
          <SidebarGroupLabel>
            <div class="flex items-center gap-x-2">
              {{ item!.title }}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="childItem in item!.items" :key="childItem.title" class="bg-card/75 cursor-default p-2 rounded-lg">
                <SidebarMenuButton as-child :is-active="childItem.isActive">
                  <div class="relative  flex   items-center justify-between ">
                    <div :href="childItem.url" :class="{ 'cursor-not-allowed  opacity-30': !childItem.component || childItem.isDisabled }" class="peer  w-full">{{ childItem.title }}</div>
                    <div v-if="childItem.component && !childItem.isDisabled" class="absolute z-10 w-full pr-4 transition-all duration-150 hover:opacity-100 opacity-0 flex justify-end">
                      <div class="  flex  items-center gap-x-2    cursor-pointer">
                        <div class="  bg-card   rounded-lg p-1 flex items-center justify-center" @click="triggerNodeComponentName = childItem.component">
                          <NuxtIcon name="si:add-line" size="20" class="text-white" />
                        </div>
                        <HoverCard>
                          <HoverCardTrigger as-child>
                            <div class="  bg-card  text-white cursor-pointer rounded-lg p-1 flex items-center justify-center">
                              <NuxtIcon name="clarity:info-line" size="20" class="text-white" />
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent class="dark w-80 prose prose-neutral prose-sm text-sm">
                            <MDC :value="childItem.description || ''" tag="article" />
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </ScrollArea>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
