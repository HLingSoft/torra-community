<script setup lang="ts">
const { t } = useI18n()
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
      title: t('Input'),
      url: '#',
      icon: 'si:input-line',
      items: [
        {
          title: t('Chat Input'),
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
          title: t('Text Input'),
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
          title: t('API Input'),
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
      title: t('Output'),
      url: '#',
      items: [
        {
          title: t('Chat Output'),
          url: '#',
          component: 'output/chat-output',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Text Output'),
          url: '#',
          component: 'output/text-output',
          isActive: true,
          description: '',
        },

      ],
    },
    {
      title: t('Prompt'),
      url: '#',
      items: [
        {
          title: t('Prompt'),
          url: '#',
          component: 'prompt/prompt',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: t('Image Recognition'),
      url: '#',
      items: [
        {
          title: t('OpenAI'),
          url: '#',
          component: 'image/recognition-openai',
          isActive: false, isDisabled: false,
          description: '',
        },
      ]
    },
    {
      title: t('Image Generation'),
      url: '#',
      items: [

        {
          title: t('OpenAI DALL·E 3'),
          url: '#',
          component: 'image/generate-openai-dalle3',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('GPT Image'),
          url: '#',
          component: 'image/generate-openai-gpt-image',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Flux'),
          url: '#',
          component: 'image/generate-replicate-flux',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Stable Diffusion'),
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('OpenArt'),
          url: '#',

          isActive: false, isDisabled: false,
          description: '',
        },


      ],
    },
    {
      title: t('Voice Recognition'),
      url: '#',
      items: [
        {
          title: t('OpenAI'),
          url: '#',
          component: 'voice/recognition-openai',
          isActive: false, isDisabled: false,
          description: '',
        }
      ]
    },
    {
      title: t('Voice Generation'),
      url: '#',
      items: [

        {
          title: t('OpenAI'),
          url: '#',
          component: 'voice/generate-openai',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Eleventlabs'),
          url: '#',
          component: 'voice/generate-eleventlabs',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Replicate Minimax'),
          url: '#',
          component: 'voice/generate-replicate-minimax',
          isActive: false, isDisabled: false,
          description: '',
        }

      ],
    },
    {
      title: t('Video'),
      url: '#',
      items: [
        {
          title: t('Replicate Kling Video'),
          url: '#',
          component: 'video/replicate-kling',
          isActive: false, isDisabled: false,
          description: '',
        }

      ],
    },
    {
      title: t('Data Source'),
      url: '#',
      items: [
        {
          title: t('API Request'),
          url: '#',
          component: 'data/api-request',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('API Tool'),
          url: '#',
          component: 'data/api-tool',
          isActive: false,
          isDisabled: false,
          description: '',
        },
        {
          title: t('Directory'),
          url: '#',
          description: '',
        },
        {
          title: t('File'),
          component: 'data/file-upload',
          isActive: false,
          isDisabled: false,
          url: '#',
          description: '',
        },
        {
          title: t('Big File'),
          component: 'data/big-file-upload',
          isActive: false,
          isDisabled: false,
          url: '#',
          description: '',
        },
        {
          title: t('MongoDB'),
          url: '#',
          description: '',
        },
        {
          title: t('SQL Query'),
          url: '#',
          description: '',
        },
        {
          title: t('URL'),
          url: '#',
          component: 'data/url',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Webhook'),
          url: '#',
          description: '',
        },
      ],
    },
    {
      title: t('Processing'),
      url: '#',
      items: [
        {
          title: t('Message to Data'),
          url: '#',
          component: 'processing/message-to-data',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Data to Message'),
          url: '#',
          component: 'processing/data-to-message',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Filter Data'),
          url: '#',
          component: 'processing/filter-data',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Filter Array'),
          url: '#',
          component: 'processing/filter-array',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Combine Data'),
          url: '#',
          component: 'processing/combine-data',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Structured To Data'),
          component: 'processing/structured-to-data',
          isActive: false, isDisabled: false,
          url: '#',
          description: '',
        },
        {
          title: t('Data To Structured'),
          component: 'processing/data-to-structured',
          isActive: false, isDisabled: false,
          url: '#',
          description: '',
        },
        {
          title: t('JSON Parser'),
          url: '#',
          component: 'processing/json-parser',
          description: '',
        },

        {
          title: t('Save File to Cloudflare'),
          url: '#',
          component: 'processing/save-file-to-cloudflare',
          isActive: false,
          isDisabled: false,
          description: '',
        },
        {
          title: t('Save File To Local'),
          url: '#',
          component: 'processing/save-file-to-local',
          isActive: false,
          isDisabled: false,
          description: '',
        },
        {
          title: t('Save File To Aliyun'),
          url: '#',

          isActive: false,
          isDisabled: false,
          description: '',
        },
        // {
        //   title: 'Split Text',
        //   url: '#',
        //   description: '',
        // },
        // {
        //   title: 'Update Data',
        //   url: '#',
        //   description: '',
        // },
      ],
    },
    {
      title: t('Models'),
      url: '#',
      items: [
        {
          title: 'Ollama',
          url: '#',
          component: 'model/ollama',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'Anthropic',
          component: 'model/anthropic',
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: 'DeepSeek',
          url: '#',
          component: 'model/deepseek',
          isActive: false, isDisabled: false,
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
          component: 'model/google',
          url: '#',
          description: '',
        },

      ],
    },
    {
      title: t('Vector Stores'),
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
      title: t('Embeddings'),
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
      title: t('Memory'),
      url: '#',
      items: [
        {
          title: t('Upstash Redis Chat Memory'),
          url: '#',
          component: 'memory/upstash-redis',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: t('Agent'),
      url: '#',
      items: [
        {
          title: t('Agent'),
          url: '#',
          component: 'agent/agent',
          isActive: false,
          isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: t('Logic'),
      url: '#',
      items: [
        {
          title: t('If-Else'),
          url: '#',
          component: 'logic/if-else',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Listen'),
          url: '#',
          component: 'logic/listen',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Loop'),
          url: '#',
          component: 'logic/loop',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Notify'),
          url: '#',
          component: 'logic/notify',
          isActive: false,
          isDisabled: false,
          description: '',
        },
        {
          title: t('Pass'),
          url: '#',
          component: 'logic/pass',
          isActive: false,
          isDisabled: false,
          description: '',
        },


      ],
    },
    {
      title: t('Tool'),
      url: '#',
      items: [

        {
          title: t('Baidu Search'),
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Calculator'),
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Google Search'),
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Tavily AI Search'),
          url: '#',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Timezone'),
          url: '#',
          component: 'tool/timezone',
          isActive: false, isDisabled: false,
          description: '',
        },

      ],
    },
    {
      title: t('Helpers'),
      url: '#',
      items: [
        {
          title: t('ID Generator'),
          url: '#',
          component: 'helper/id-generator',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Audio Duration'),
          url: '#',
          component: 'helper/audio-duration',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Video Duration'),
          url: '#',
          component: 'helper/video-duration',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Message History'),
          url: '#',
          component: 'helper/message-history',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Message Store'),
          url: '#',
          component: 'helper/message-store',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('Structured Output'),
          url: '#',
          component: 'helper/structured-output',
          isActive: false, isDisabled: false,
          description: '',
        },
        {
          title: t('List Output'),
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
          title: t('MCP Tools HTTP'),
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
      title: t('SubFlow'),
      url: '#',
      items: [
        {
          title: t('Workflow'),
          url: '#',
          component: 'subflow/workflow',
          isActive: false,
          isDisabled: false,
          description: '',
        },


      ],
    },
    {
      title: t('Plugins'),
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
  <Sidebar v-bind="props" class="   bg-background  border-[hsl(var(--border))] ">
    <SidebarHeader>
      <WorkflowWorkspaceSwitcher />
      <WorkflowSearch class="mt-1" v-model="searchKeyword" />
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
              <SidebarMenuItem v-for="childItem in item!.items" :key="childItem.title" class="bg-gray-50 hover:bg-gray-150 dark:bg-card/75 dark:hover:bg-muted cursor-default p-2 rounded-lg">
                <SidebarMenuButton as-child :is-active="childItem.isActive">
                  <div class="relative  flex   items-center justify-between ">
                    <div :href="childItem.url" :class="{ 'cursor-not-allowed  opacity-30': !childItem.component || childItem.isDisabled }" class="peer  w-full truncate">{{ childItem.title }}</div>
                    <div v-if="childItem.component && !childItem.isDisabled" class="absolute z-10 w-full pr-4 transition-all duration-150 hover:opacity-100 opacity-0 flex justify-end">
                      <div class="  flex  items-center gap-x-2    cursor-pointer">
                        <div class="     rounded-lg p-1 flex items-center justify-center" @click="triggerNodeComponentName = childItem.component">
                          <NuxtIcon name="si:add-line" size="20" class="" />
                        </div>
                        <!-- <HoverCard>
                          <HoverCardTrigger as-child>
                            <div class="  bg-card   cursor-pointer rounded-lg p-1 flex items-center justify-center">
                              <NuxtIcon name="clarity:info-line" size="20" class="" />
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent class="dark w-80 prose prose-neutral prose-sm text-sm">
                            <MDC :value="childItem.description || ''" tag="article" />
                          </HoverCardContent>
                        </HoverCard> -->
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
