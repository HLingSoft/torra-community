# Torra Community Edition

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

> **基于 Nuxt 4（最新版），所有依赖包保持最新。**

**Torra Community Edition** 是一款开源的 AI 工作流与智能体可视化编辑器。  
灵感来自 **Coze** 与 **Langflow**，但完全使用 **Vue 3 + TypeScript** 构建。

与 Coze（闭源）和 Langflow（React + Python）不同，Torra 采用 **Nuxt 4**、**VueFlow**、**Tailwind CSS v4**、**Shadcn UI**、**LangChain.js** 和 **FeathersJS**，带来现代、高性能的开发体验。

---

## 🌟 v0.6 更新亮点

| 功能 | 说明 |
|------|------|
| **SQLite / MySQL / MongoDB** | 内置支持多种主流数据库：开发推荐使用 SQLite，生产支持 MySQL，灵活集成 MongoDB。 |
| **本地 ↔ 云端 无缝切换** | 设置 `TORRA_DATASOURCE=local` 或 `cloud`，即可自动迁移数据。 |
| **FeathersJS 全链路 Hook** | 所有数据库操作（find / get / create / patch / remove）都经过可配置 Hook，可轻松实现鉴权、限流、审计、LiveQuery 等。 |
| **类 GraphQL 接口风格** | 统一的数据访问语法，声明式设计，适合一人全栈项目开发，无需专门后端工程师介入。 |

---

## 🌐 视频演示

[![在线体验](https://file.web.hlingsoft.com/SN1tGlRFSFsCB2B4in87AeKxt6nGFRrY/torra_screenshot.png)](https://file.web.hlingsoft.com/70ccmgMsHhoo8TnCFBqRWhBiMXudgrem/%E9%A3%9E%E4%B9%A620250627-212754.mp4)

---

## ✨ 主要特性

- 🚀 **VueFlow** 可视化拖拽式节点编辑
- 🎨 **Tailwind CSS v4 + Shadcn UI** 现代化界面
- 🤖 原生集成 **LangChain.js**，快速调用多家 LLM
- 🗂 存储可插拔：默认使用本地 **SQLite**，支持切换至 **MySQL** 或 **MongoDB**，可一键迁移至线上数据库服务。
- 🔄 **本地 / 在线** 数据零停机迁移
- 🪝 **FeathersJS Hook**：鉴权、限流、审计、实时推送一步到位
- 🧠 支持 OpenAI、Anthropic、Google、DeepSeek、Qwen 等主流大模型
- 🖼 支持文本、图片、音频、视频等多模态数据
- 🧪 内置 Playground 及调试工具
- 🚀 一键发布 REST / Webhook / SSE API
- 📊 完整的 LLM 调用日志与计费系统
- 🌍 多语言 UI（英文、中文、日文…）

### 🧩 内置节点 & 功能

| 分类 | 数量 | 代表功能 |
|------|------|----------|
| 输入 | 3 | Chat Input、Text Input、API Input |
| 输出 | 2 | Chat Output、Text Output |
| Prompt | 1 | Prompt |
| 图片 | 2 | OpenAI 图片识别、图片生成 |
| 语音 | 2 | OpenAI 语音识别、语音合成 |
| 数据源 | 8 | API Request、Directory、File、MongoDB、SQL Query、URL、Webhook |
| 处理 | 8 | Message↔Data、Filter、Combine、JSON Parser、保存至阿里云 OSS 等 |
| 模型 | 5 | Ollama、Anthropic、DeepSeek、OpenAI、Google |
| 向量库 | 1 | Milvus |
| Embedding | 1 | OpenAI |
| Memory | 1 | Upstash Redis Chat Memory |
| Agent | 1 | Agent |
| 逻辑 | 5 | If‑Else、Listen、Loop、Notify、Pass |
| 工具 | 5 | 百度搜索、Google Search、Tavily、Calculator、Timezone/Geo |
| Helpers | 5 | ID Generator、Message Store、Structured Output、List Output、History |
| MCP | 3 | MCP HTTP、MCP SSE、MCP stdio |
| 子流程 | 1 | Workflow |
| 插件 | 0 | 敬请期待 |

---

## 🧾 其他亮点

- 📅 **完整运行时支持**：所有功能开箱即用，包括数据库、权限、工作流执行、日志、计费、多语言 UI。
- 🖥 **功能齐全的后端系统**：内置完整的 FeathersJS 后端，支持用户权限、数据操作、日志、LiveQuery 和插件扩展。
- 🧑‍💻 **100% 开源**：客户端与服务端代码全部开源，遵循 MIT 协议，真正无供应商绑定。
- 🧩 **全栈 TypeScript**：前后端均采用 TypeScript（Nuxt4 + FeathersJS + LangChain.js），支持企业级接入，方便团队协作。
- 🧠 **原生支持 LangChain 与 LangGraph**：即插即用，逐步集成 LangGraph，紧跟社区 Agentic 架构发展趋势。

---

## 🖼 更多截图

| 节点编辑 | Playground | API 调用 | 极简模式 |
|----------|------------|----------|----------|
| ![Nodes](https://file.web.hlingsoft.com/0A0hfGrrTIPm9scihpEaarogPnMAWhbO/%E6%88%AA%E5%B1%8F2025-06-26%2011.18.59.png) | ![Play](https://file.web.hlingsoft.com/DPBatHp8K42r6qc0hWHW5if7FfmEtpHg/%E6%88%AA%E5%B1%8F2025-06-26%2011.16.08.png) | ![API](https://file.web.hlingsoft.com/lKilFV9MR3r6flvFCPVlcquvvHyb0fL7/%E6%88%AA%E5%B1%8F2025-07-26%2014.46.22.png) | ![Minimal](https://file.web.hlingsoft.com/Oos0WK5b76heWyUwH2zTVhOgHBB5BPYf/%E6%88%AA%E5%B1%8F2025-07-26%2014.45.27.png) |

---


## 📱  加入讨论社区

加入我们的社区，分享想法、获取支持、与其他用户协作：

<img src="https://file.web.hlingsoft.com/HK8AYmIErpERLFQTqJN3LSTe6KEt1T8H/torra.jpg" alt="微信群二维码" width="200" />



---

## 📱  API Key 领取


需要 OpenAI、Claude、DeepSeek、可灵、即梦、Sora、Flux、Minimax、ElevenLabs 等平台的免费 Key？
扫描二维码添加作者微信，备注 GitHub 用户名，即可领取各大 LLM 免费 Key：

<img src="https://file.web.hlingsoft.com/6hMSdEMQ6cCDCCWmReDNcEL63gW0UAap/WechatIMG1891.jpg" alt="author" width="200" />

---

## ⚙️ 环境要求

- **Node.js ≥ 20**
- **npm ≥ 10**
- **pnpm ≥ 10**

> 建议使用 [Volta](https://volta.sh) 管理 Node 版本

---

## ⚡ 快速开始

### 1. 一键安装包（无开发环境）

1. 下载 [torra‑starter.zip](https://file.web.hlingsoft.com/maO3Mw0xynoVsmeBnRXqOzLBP1kmhDsA/torra-starter.zip)  
2. Windows 双击 `start.bat`；macOS 右键→打开 `start.command`  
3. 浏览器自动打开 <http://localhost:3000>

### 2. 开发者快速上手

```bash
npx create-torra-app my-app
cd my-app
pnpm dev          # 默认 SQLite
```

#### 切换到 MongoDB

```bash

# .env
TORRA_DATASOURCE=cloud
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/torra
```

## 📄 许可证
本项目采用 MIT License，使用、修改、分发须保留原始版权及作者信息。

## 🙌 鸣谢
由 Torra Team 维护。
在线体验 → https://www.torra.cloud
如果觉得有用，请在 GitHub ⭐Star！
