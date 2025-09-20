 
# Torra 社区版（Torra Community Edition）

🌐 [简体中文](./README.md) | [English](./README.en.md) | [日本語](./README.ja.md)

> **基于 Nuxt 4 的现代化 AI 工作流与智能体可视化编辑器。**

**Torra 社区版**是 **除了 n8n 之外的第二种选择**：参考了 **Coze** 与 **Langflow** 的产品形态，但采用 **TypeScript、Vue 3、Nuxt 4** 从前到后完整实现。我们提供轻量但可生产的架构：前端 VueFlow + Tailwind v4 + shadcn/ui，后端 FeathersJS，内置 LangChain.js 运行时，默认自托管，方便企业落地与扩展。

- **Nuxt 4 + Vue 3 + TypeScript** 技术栈  
- **VueFlow** 可视化编排，**Tailwind CSS v4 + shadcn/ui** 现代 UI  
- 全栈 TypeScript：**FeathersJS** 后端 + **LangChain.js** 运行时  
- 多数据库：SQLite / MySQL / MongoDB，支持本地 ↔ 云端热切换

**预告：**我们将于 **10 月中旬** 发布**大版本更新**。  
想提前体验？现在就访问 [https://www.torra.cloud](https://www.torra.cloud)，或加入我们的用户群，我们会在群内第一时间发布迭代信息与预览。

---

## ✨ 功能特性

- 🚀 可视化工作流编辑器（VueFlow）  
- 🎨 现代化 UI（Tailwind CSS v4 + shadcn/ui）  
- 🤖 原生集成 LangChain.js  
- 🗂 可插拔存储：默认本地 **SQLite**，可选 **MySQL / MongoDB**，一键迁移至远端实例  
- 🔄 **本地 ↔ 云端热切换**，零停机  
- 🪝 全链路 FeathersJS Hook（所有 CRUD）  
- 🧠 覆盖主流大模型：OpenAI、Anthropic、Google、DeepSeek、Qwen、…  
- 📦 连接 MySQL、PostgreSQL、Redis、Elasticsearch、文件、URL、API  
- 🖼 多模态：文本 · 图片 · 音频 · 视频  
- 🧪 内置 Playground 与一键 API 发布  
- 📊 用量日志与计费  
- 🌍 多语言界面（English / 中文 / 日本語 / …）  
- ☁️ **SaaS 就绪**：云端版基于 **Parse Platform**

---

## 🧩 内置模块

> 与 **Langflow / Dify / Coze** 的基础能力**对齐**（常用节点均已覆盖），并在此基础上提供**更丰富的扩展插件**（持续增加中）。  
> **模态覆盖：**文本 • **图片** • **音频** • **视频**。**模型生态：**OpenAI、Anthropic、Google、DeepSeek、Qwen、Ollama 等。

| 分类              | 数量/状态 | 亮点                                                                             |
| ----------------- | -------- | -------------------------------------------------------------------------------- |
| Input             | 3        | Chat Input、Text Input、API Input                                                |
| Output            | 2        | Chat Output、Text Output                                                         |
| Prompt            | 1        | Prompt Builder                                                                   |
| Image             | 7        | GPT Image、Stable Diffusion、Flux、Runway、Seedream、Qwen、DALL·E 3              |
| 图像识别          | 5        | OpenAI Vision、Gemini、Qwen、Doubao、Zhipu                                       |
| 语音              | 6        | OpenAI TTS/STT、ElevenLabs、Minimax（更多引擎规划中）                            |
| 视频              | 9        | Kling、Sora、Pika、Runway、Vidu、Google Veo、Dreamina、Alibaba Wan、Hailuo      |
| 数据源            | 9+       | API Request/Tool、文件（多/单）、目录、MongoDB、SQL、URL、Webhook               |
| Processing        | 11+      | 消息↔数据、过滤、合并、JSON、结构化↔数据、保存到 OSS/Cloud                      |
| 模型              | 9+       | OpenAI、Anthropic、Google、xAI、DeepSeek、通义、智谱、豆包、Ollama               |
| 向量库            | 1        | Milvus                                                                           |
| 向量化            | 1        | OpenAI Embedding                                                                 |
| 记忆              | 1        | Upstash Redis Memory                                                             |
| Agent             | 1        | Agent 节点                                                                       |
| 逻辑              | 5        | If-Else、Loop、Listen、Notify、Pass                                              |
| 工具              | 3        | Web Search、Tavily AI Search、Timezone                                           |
| 辅助              | 12+      | 各类 ID、会话/用户/工作流/追踪、Tips、历史/存储、时长、列表                     |
| MCP               | 3        | HTTP、SSE、stdio                                                                 |
| 子流程            | 1        | Workflow（可复用流程）                                                           |
| 插件              | 持续增长 | Markdown→WeChat、Simple Browser、Page Capture、File Marker —— **更多即将上线**  |

_我们会持续补齐与 Langflow / Dify / Coze 的功能，同时提供更多增值插件与供应商适配。_

---

## ☁️ SaaS 版本 —— 基于 Parse

**Torra Cloud** 为 **基于 Parse Platform 的多租户 SaaS 版本**，面向需要即开即用、企业可控的团队与组织：

- **多租户组织 / 项目**，租户级数据隔离  
- **RBAC 与 SSO**（OAuth / OIDC），API Key（支持 BYOK）  
- **套餐、配额与用量计量**：按代理数、运行次数、Token、存储、Webhook 等维度限额  
- **计费与发票**（对接 Stripe），基于用量的限流策略  
- **审计与合规**：请求/响应脱敏、导出与留存策略  
- **Webhook / 事件流**，支持 CI/CD 与 MLOps；LiveQuery 实时订阅  
- **零停机迁移** 与回滚；蓝绿发布  
- **可观测性**：工作流级 Trace、Metrics、结构化日志  

欢迎在 [https://www.torra.cloud](https://www.torra.cloud) 直接体验，或加入我们的用户群，我们会在群内发布迭代与预览信息。

---

## 📱  加入社区

欢迎加入社区，交流想法、获取支持、与更多用户合作：

<img src="https://file.web.hlingsoft.com/HK8AYmIErpERLFQTqJN3LSTe6KEt1T8H/torra.jpg" alt="微信群二维码" width="200" />

 
---

## 📄 许可

MIT License — 请保留署名。

---

## 🙌 维护团队

由 Torra 团队创建与维护。  
在线演示 → [https://www.torra.cloud](https://www.torra.cloud)

欢迎 Star 我们的 GitHub！
 