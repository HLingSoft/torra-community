<script setup lang="ts">
 
const props = defineProps<{ [key: string]: unknown }>()
const searchKeyword = ref('')
const { triggerNodeComponentName } =storeToRefs( useWorkflowStore())
watch(
  () => triggerNodeComponentName,
  (newValue) => {
    if (newValue) {
      // addNodeByCurrentProjectPosition(newValue)
      console.log('triggerNodeComponentName', newValue)
    }
  },
  { immediate: true }
)
const data = {
  
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
          isActive: false,
        },
        {
          title: 'Question',
          url: '#',
          description: `Question

- **组件名称**："Question"
- **描述**：
   通用对用户进行提问，并等待用户回答。
- **功能特点**：
  - 提问组件
  - 可设置问题类型（单选、多选、文本输入等）
  - 可绑定至 "Agent" 节点进行实时交互
- **使用场景**：
  - 用于收集用户信息
  - 需要用户输入的场景
  - 需要用户确认的场景
`,
          isActive: false,
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
          isActive: false,
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
          isActive: false,
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
          isActive: false,
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
          isActive: false,
          description: '',
        },
        {
          title: 'Filter   Data',
          url: '#',
          component: 'processing/filter-data',
          isActive: false,
          description: '',
        },
        {
          title: 'Combine Data',
          url: '#',
          description: '',
        },
        {
          title: 'Combine Text',
          url: '#',
          description: '',
        },
        {
          title: 'JSON Cleaner',
          url: '#',
          description: '',
        },
        {
          title: 'LLM Router',
          url: '#',
          description: '',
        },
        {
          title: 'Parse DataFrame',
          url: '#',
          description: '',
        },
        {
          title: 'Save to File',
          url: '#',
          description: '',
        },
        {
          title: 'Split Text',
          url: '#',
          description: '',
        },
        {
          title: 'Update Data',
          url: '#',
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
        
          isActive: false,
          description: '',
        },
        {
          title: 'Anthropic',
          url: '#',
          isActive: false,
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
          isActive: false,
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
          isActive: false,
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
          isActive: false,
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
          isActive: false,
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
          isActive: false,
          description: '',
        },
        {
          title: 'Listen',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: 'Loop',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: 'Notify',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: 'Pass',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: 'Run Flow',
          url: '#',
          isActive: false,
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
          isActive: false,
          description: '',
        },
        {
          title: '计算器',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: 'Google 搜索',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: 'Tavily AI 搜索',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: '时区/地理位置',
          url: '#',
          component: 'tool/timezone',
          isActive: false,
          description: '',
        },

      ],
    },
    {
      title:'Helpers',
      url: '#',
      items:[
      {
          title: 'ID 生成器',
          url: '#',
          component: 'helper/id-generator',
          isActive: false,
          description: '',
        },

        {
          title: 'Message History',
          url: '#',
          component: 'helper/message-history',
          isActive: false,
          description: '',
        },
        {
          title: 'Message Store',
          url: '#',
          component: 'helper/message-store',
          isActive: false,
          description: '',
        },
        {
          title: 'Structured Output',
          url: '#',
          component: 'helper/structured-output',
          isActive: false,
          description: '',
        },
        

       
      ]
    },
    {
      title: 'MCP',
      url: '#',
      items: [
        {
          title: 'MCP Tools SSE',
          url: '#',
          isActive: false,
          description: '',
        },
        {
          title: 'MCP Tools stdio',
          url: '#',
          description: '',
        },

      ],
    },
    // {
    //   title: 'Bundles',
    //   url: '#',
    //   items: [
    //     {
    //       title: 'LangChain',
    //       url: '#',
    //       isActive: false,
    //       children: [
    //         {
    //           title: 'CharacterTextSplitter',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //         {
    //           title: 'CSVAgent',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //         {
    //           title: 'Tool Calling Agent',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //         {
    //           title: 'OpenAI Tools Agent',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //         {
    //           title: 'OpenAPI Agent',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'AssemblyAI',
    //       url: '#',
    //       isActive: false,
    //       children: [
    //         {
    //           title: 'Transcription',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //         {
    //           title: 'Translation',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //         {
    //           title: 'Summarization',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //         {
    //           title: 'Sentiment Analysis',
    //           url: '#',
    //           isActive: false,
    //           description: '',
    //         },
    //       ],
    //     },

    //   ],
    // },

  ],
}


// const addNodeByCurrentProjectPosition=async(component:string)=>{
//   await promiseTimeout(2000)
//   console.log('project',project)
//   const position = project({ x: 150, y: 150 })
//   console.log('position', position)
//   addNode(component, position)
// }
const filteredNav = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return data.navMain

  return data.navMain
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

</script>

<template>
  <Sidebar v-bind="props" class="dark   bg-[#18181B] text-white border-[hsl(var(--border))] ">
    <SidebarHeader>
      <WorkflowWorkspaceSwitcher   />
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
              <SidebarMenuItem v-for="childItem in item!.items" :key="childItem.title" class="bg-[#27272A]/75 cursor-default p-2 rounded-lg">
                <SidebarMenuButton as-child :is-active="childItem.isActive">
                  <div class="relative  flex   items-center justify-between ">
                    <div :href="childItem.url" :class="{'cursor-not-allowed  opacity-30':!childItem.component}" class="peer  w-full">{{ childItem.title }}</div>
                    <div v-if="childItem.component " class="absolute z-10 w-full pr-4 transition-all duration-150 hover:opacity-100 opacity-0 flex justify-end">
                      <div class="  flex  items-center gap-x-2    cursor-pointer">
                        <div class="  bg-[#27272A]   rounded-lg p-1 flex items-center justify-center" @click="triggerNodeComponentName=childItem.component">
                          <NuxtIcon name="si:add-line" size="20" class="text-white" />
                        </div>
                        <HoverCard>
                          <HoverCardTrigger as-child>
                            <div class="  bg-[#27272A]  text-white cursor-pointer rounded-lg p-1 flex items-center justify-center">
                              <NuxtIcon name="clarity:info-line" size="20" class="text-white" />
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent class="dark w-80 prose prose-neutral prose-sm text-sm">
                            <MDC :value="childItem.description" tag="article" />
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
