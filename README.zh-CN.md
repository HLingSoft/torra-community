# Torra 社区版

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

**Torra 社区版** 是一个开源的可视化 AI 智能体与工作流构建器，灵感来源于 **Coze** 和 **Langflow**，但完全基于 **Vue + TypeScript** 构建。

与 Coze（闭源）和 Langflow（React + Python）不同，Torra 使用 **Nuxt3**、**VueFlow**、**Tailwind CSS v4**、**Shadcn UI** 和 **LangChain.js** 打造，为开发者和团队提供现代化、高性能的体验。

本版本完全免费，支持自由使用、修改和扩展。

![主界面截图](https://file.web.hlingsoft.com/26NbxPHeTGXNCO23MhsEXb5yE82VUo6d/screenshot.png)

---

## ✨ 特性亮点

- 🚀 使用 VueFlow 构建的可视化工作流编辑器
- 🎨 采用 Tailwind CSS v4 + Shadcn 打造的现代 UI
- 🤖 集成 LangChain.js，便捷搭建大模型工作流
- 🗂 本地优先，无需依赖云服务
- ⚡ 快速原型开发，易于扩展
- 🔓 100% 开源，社区友好
- 🧠 支持主流大模型：OpenAI、Anthropic、Google、DeepSeek、Qwen 等
- 🗃 支持多种数据源：MySQL、PostgreSQL、MongoDB、SQLite、Redis、Elasticsearch
- 📄 支持多种数据格式：CSV、JSON、XML、YAML
- 🔧 支持完整数据处理流程：清洗、转换、分析、可视化
- 🛢 灵活的后端支持：本地文件、云端、数据库
- 🔍 支持 SQL、NoSQL、GraphQL 查询
- 🖼 支持多模态数据：文本、图像、音频、视频
- 🧪 内置 Playground，用于测试与调试智能体
- 🚀 一键发布为 API 接口
- 📊 提供大模型调用日志与计费系统
- 🌍 多语言 UI（支持英文、中文、日文等）

### 🧩 内置模块与功能列表

| 模块         | 功能数量 | 功能列表                                                                 |
|--------------|----------|--------------------------------------------------------------------------|
| 输入         | 3        | Chat 输入、文本输入、API 输入                                           |
| 输出         | 2        | Chat 输出、文本输出                                                     |
| 提示词       | 1        | Prompt                                                                   |
| 图像         | 2        | OpenAI 图像识别、OpenAI 图像生成                                       |
| 语音         | 2        | OpenAI 语音识别、OpenAI 语音生成                                       |
| 数据源       | 8        | API 请求、API 工具、目录、文件、MongoDB、SQL 查询、URL、Webhook         |
| 数据处理     | 8        | 消息转数据、数据转消息、筛选数据、合并数据、结构化转数据、数据转结构化、JSON 解析器、保存文件至阿里云 |
| 模型         | 5        | Ollama、Anthropic、DeepSeek、OpenAI、Google                            |
| 向量存储     | 1        | Milvus                                                                   |
| 向量嵌入     | 1        | OpenAI                                                                   |
| 对话存储     | 1        | Upstash Redis 聊天记忆                                                 |
| 智能体       | 1        | Agent                                                                    |
| 逻辑控制     | 5        | 条件判断（If-Else）、监听（Listen）、循环（Loop）、通知（Notify）、传递（Pass） |
| 工具         | 5        | 百度搜索、计算器、谷歌搜索、Tavily AI 搜索、时区/地理位置               |
| 辅助工具     | 5        | ID 生成器、消息历史、消息存储、结构化输出、列表输出                   |
| MCP 模块     | 3        | MCP HTTP 工具、MCP SSE 工具、MCP stdio 工具                            |
| 子流程       | 1        | 工作流（Workflow）                                                      |
| 插件         | 0        | Comming Soon                                                                          |

---

## 🖼 更多截图

| Nodes | Playground | API |
|--------|--------|--------|
| ![1](https://file.web.hlingsoft.com/0A0hfGrrTIPm9scihpEaarogPnMAWhbO/%E6%88%AA%E5%B1%8F2025-06-26%2011.18.59.png) | ![2](https://file.web.hlingsoft.com/DPBatHp8K42r6qc0hWHW5if7FfmEtpHg/%E6%88%AA%E5%B1%8F2025-06-26%2011.16.08.png) | ![3](https://file.web.hlingsoft.com/zIHhaij2H6tBbym8eap1aqar2svuQ0q7/%E6%88%AA%E5%B1%8F2025-06-26%2011.24.37.png) |

---

## 📱 加入社区

欢迎加入 Torra 用户微信群 👇  
<img src="https://file.web.hlingsoft.com/HK8AYmIErpERLFQTqJN3LSTe6KEt1T8H/torra.jpg" alt="微信群二维码" width="200" />


---

## ⚙️ 环境要求

- **Node.js ≥ 20**
- **npm ≥ 10**
- **pnpm ≥ 10**（推荐）

> ⚠️ 建议使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node 版本

---

## ⚡ 快速上手

### 🏁 推荐方式

```bash
npx create-torra-app my-app
cd my-app
pnpm dev
```

### 🛠 手动方式

```bash
npm i -g pnpm
git clone https://github.com/HLingSoft/torra-community.git
cd torra-community
pnpm install
pnpm dev
```

---

## 📄 许可证

本项目使用 [MIT License](./LICENSE) 开源。

> 当你使用、修改或分发本项目（无论部分还是全部）时，  
> 请保留原始许可证，并 **明确注明 Torra 团队** 为作者。

---

## 🙌 致谢

由 **Torra 团队** 创建与维护。  
在线试用 👉 [https://www.torra.cloud](https://www.torra.cloud)

💬 欢迎提出建议与反馈，欢迎 [提交 issue](https://github.com/HLingSoft/torra-community/issues)  
💖 如果你觉得这个项目不错，欢迎在 GitHub 上给我们一个 ⭐！
