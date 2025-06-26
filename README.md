# Torra Community Edition

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

**Torra Community Edition** is an open-source visual editor for building AI agents and workflows — inspired by **Coze** and **Langflow**, but built entirely with **Vue + TypeScript**.

Unlike Coze (closed-source) and Langflow (React + Python), Torra is built with **Nuxt3**, **VueFlow**, **Tailwind CSS v4**, **Shadcn UI**, and **LangChain.js** — providing a modern, high-performance experience for developers and teams.

This edition is free to use, modify, and extend.  

![Main Screenshot](https://file.web.hlingsoft.com/SN1tGlRFSFsCB2B4in87AeKxt6nGFRrY/torra_screenshot.png)

---

## ✨ Features

- 🚀 Visual workflow editor powered by VueFlow
- 🎨 Modern UI with Tailwind CSS v4 + Shadcn
- 🤖 Built-in LangChain.js integration for LLM workflows
- 🗂 Local-first storage (no cloud lock-in)
- ⚡ Fast to prototype, easy to extend
- 🔓 100% open-source and community-friendly
- 🧠 Supports major LLMs: OpenAI, Anthropic, Google, DeepSeek, Qwen, etc.
- 🗃 Supports diverse data sources: MySQL, PostgreSQL, MongoDB, SQLite, Redis, Elasticsearch
- 📄 Handles various data formats: CSV, JSON, XML, YAML
- 🔧 Full data processing: cleaning, transforming, analysis, visualization
- 🛢 Flexible backends: local file, cloud, databases
- 🔍 Query with SQL, NoSQL, and GraphQL
- 🖼 Supports multimodal data: text, images, audio, video
- 🧪 Built-in Playground for agent testing & debugging
- 🚀 One-click API publishing
- 📊 Full logging and billing system for LLM usage
- 🌍 Multi-language UI (English, 中文, 日本語, etc.)

### 🧩 Built-in Modules & Features

| Module        | Count | Features                                                                 |
|---------------|-------|--------------------------------------------------------------------------|
| Input         | 3     | Chat Input, Text Input, API Input                                       |
| Output        | 2     | Chat Output, Text Output                                                |
| Prompt        | 1     | Prompt                                                                   |
| Image         | 2     | OpenAI Image Recognition, OpenAI Image Generation                       |
| Voice         | 2     | OpenAI Voice Recognition, OpenAI Voice Generation                       |
| Data Sources  | 8     | API Request, API Tool, Directory, File, MongoDB, SQL Query, URL, Webhook |
| Processing    | 8     | Message to Data, Data to Message, Filter Data, Combine Data, Structured To Data, Data To Structured, JSON Parser, Save File To Aliyun |
| Models        | 5     | Ollama, Anthropic, DeepSeek, OpenAI, Google                             |
| Vector Stores | 1     | Milvus                                                                   |
| Embeddings    | 1     | OpenAI                                                                   |
| Memory        | 1     | Upstash Redis Chat Memory                                               |
| Agent         | 1     | Agent                                                                    |
| Logic         | 5     | If-Else, Listen, Loop, Notify, Pass                                     |
| Tools         | 5     | Baidu Search, Calculator, Google Search, Tavily AI Search, Timezone/Geo |
| Helpers       | 5     | ID Generator, Message History, Message Store, Structured Output, List Output |
| MCP           | 3     | MCP Tools HTTP, MCP Tools SSE, MCP Tools stdio                          |
| SubFlow       | 1     | Workflow                                                                 |
| Plugins       | 0     | Comming Soon                                                                        |

---

## 🖼 More Screenshots

| Nodes | Playground | API |
|--------------|--------------|--------------|
| ![1](https://file.web.hlingsoft.com/0A0hfGrrTIPm9scihpEaarogPnMAWhbO/%E6%88%AA%E5%B1%8F2025-06-26%2011.18.59.png) | ![2](https://file.web.hlingsoft.com/DPBatHp8K42r6qc0hWHW5if7FfmEtpHg/%E6%88%AA%E5%B1%8F2025-06-26%2011.16.08.png) | ![3](https://file.web.hlingsoft.com/zIHhaij2H6tBbym8eap1aqar2svuQ0q7/%E6%88%AA%E5%B1%8F2025-06-26%2011.24.37.png) |

---
 

## ⚙️ Requirements

- **Node.js ≥ 20**
- **npm ≥ 10**
- **pnpm ≥ 10** (recommended)

> ⚠️ Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions if needed.

---

## ⚡ Getting Started

### 🏁 Quick Start (Recommended)

```bash
npx create-torra-app my-app
cd my-app
pnpm dev
```

### 🛠 Manual Setup

```bash
npm i -g pnpm
git clone https://github.com/HLingSoft/torra-community.git
cd torra-community
pnpm install
pnpm dev
```

---

## 📄 License

This project is open-sourced under the [MIT License](./LICENSE).

> When using, modifying, or redistributing this project (in whole or in part),  
> you must retain the original license and **clearly attribute the Torra Team** as the authors.

---

## 🙌 Acknowledgment

Created and maintained by the **Torra Team**.  
Try it online 👉 [https://www.torra.cloud](https://www.torra.cloud)

💬 We welcome feedback and suggestions — feel free to [open an issue](https://github.com/HLingSoft/torra-community/issues).  
💖 If you find this project useful, please star ⭐ us on GitHub!
