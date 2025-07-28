# Torra Community Edition

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

> **Built with Nuxt 4 (latest). All packages are kept up‑to‑date.**

**Torra Community Edition** is an open-source visual editor for building AI agents and workflows — inspired by **Coze** and **Langflow**, but entirely implemented using **Vue 3 + TypeScript**.

While **Coze Studio** (React + Go) and **Langflow** (React + Python) follow different architecture stacks, **Torra** is uniquely powered by **Nuxt 4**, **VueFlow**, **Tailwind CSS v4**, **Shadcn UI**, **LangChain.js**, and **FeathersJS**, offering a **lightweight yet production-ready stack** designed for **seamless enterprise deployment**. It provides a full-stack TypeScript experience, self-hosting by default, multi-language UI, and a built-in runtime for quick integration into enterprise environments.

---

## 🌟 What’s new in v0.6

| Feature | Description |
|---------|-------------|
| **SQLite, MySQL & MongoDB** | Out‑of‑the‑box support for multiple back‑ends: SQLite (dev), MySQL (prod), MongoDB (flexible). |
| **Local ↔ Cloud Seamless Switch** | Toggle `TORRA_DATASOURCE=local | cloud` and Torra migrates data automatically. |
| **Full FeathersJS Hooks** | All CRUD operations (`find`, `get`, `create`, `patch`, `remove`) pass through configurable hooks for auth, rate‑limit, audit‑log, LiveQuery, etc. |
| **GraphQL‑style API Schema** | Unified data access via declarative GraphQL-like syntax. Ideal for solo fullstack workflows – no backend engineers required. |

---

## 🌐 Demo Video

[![Try it Online](https://file.web.hlingsoft.com/SN1tGlRFSFsCB2B4in87AeKxt6nGFRrY/torra_screenshot.png)](https://file.web.hlingsoft.com/70ccmgMsHhoo8TnCFBqRWhBiMXudgrem/%E9%A3%9E%E4%B9%A620250627-212754.mp4)

---

## ✨ Features

- 🚀 Visual workflow editor (VueFlow)
- 🎨 Modern UI (Tailwind CSS v4 + Shadcn UI)
- 🤖 Built‑in LangChain.js integration
- 🗂 Pluggable storage: default local **SQLite**, optional **MySQL** or **MongoDB**, with one-click migration to remote MongoDB or MySQL services.
- 🔄 **Hot‑swap** local ↔ online with zero downtime
- 🪝 FeathersJS hook pipeline on every DB operation
- 🧠 Supports major LLMs: OpenAI, Anthropic, Google, DeepSeek, Qwen, …
- 📦 Connects to MySQL, PostgreSQL, Redis, Elasticsearch, files, URLs, APIs
- 🖼 Multimodal data: text · image · audio · video
- 🧪 Built‑in playground & one‑click API publishing
- 📊 Usage logging & billing
- 🌍 Multi‑language UI (English, 中文, 日本語, …)

### 🧩 Built‑in Modules

| Category          | Count | Highlights                                          |
| ----------------- | ----- | --------------------------------------------------- |
| Input             | 3     | Chat Input, Text Input, API Input                   |
| Output            | 2     | Chat Output, Text Output                            |
| Prompt            | 1     | Prompt Builder                                      |
| Image             | 5     | DALL·E 3, GPT Image, Stable Diffusion, OpenArt      |
| Image Recognition | 1     | OpenAI Vision                                       |
| Voice             | 5     | OpenAI TTS/STT, ElevenLabs, Minimax                 |
| Video             | 1     | Replicate Kling Video                               |
| Data Sources      | 9     | API Request, File, Directory, MongoDB, SQL, Webhook |
| Processing        | 11+   | Message↔Data, Filters, Combine, JSON, Save to OSS   |
| Models            | 5     | OpenAI, DeepSeek, Google, Anthropic, Ollama         |
| Vector Store      | 1     | Milvus                                              |
| Embeddings        | 1     | OpenAI Embedding                                    |
| Memory            | 1     | Upstash Redis Memory                                |
| Agent             | 1     | Agent Node                                          |
| Logic             | 5     | If‑Else, Loop, Listen, Notify, Pass                 |
| Tools             | 5     | Google/Baidu Search, Tavily, Calculator, Timezone   |
| Helpers           | 7     | ID Generator, History, List Output, Duration Tools  |
| MCP               | 3     | HTTP, SSE, stdio                                    |
| SubFlow           | 1     | Workflow (Reusable Flow)                            |
| Plugins           | —     | Plugin support under development                    |


---
## 🧾 Additional Highlights

- 📅 **Complete Runtime**: All features work out-of-the-box from **Day 1**, including database, auth, workflow runtime, logging, billing, and multi-language UI.
- 🖥 **Fully Functional Backend**: Ships with a complete **FeathersJS backend system**, supporting user auth, role control, data ops, logs, LiveQuery, and plugin hooks.
- 🧑‍💻 **100% Open Source**: All client + server code is open-sourced under **MIT License** – no vendor lock-in.
- 🧩 **Fullstack TypeScript**: End-to-end TypeScript (Nuxt 4 + FeathersJS + LangChain.js), enabling **enterprise-grade integration** and easier onboarding for teams.
- 🧠 **LangChain & LangGraph Native Support**: Out-of-the-box compatibility with **LangChain.js** and progressive integration of **LangGraph**, following the latest agentic architectures and community best practices.

---


## 🖼 More Screenshots

| Nodes | Playground | API | Minimal Mode |
|-------|------------|-----|-----------|
| ![Nodes](https://file.web.hlingsoft.com/0A0hfGrrTIPm9scihpEaarogPnMAWhbO/%E6%88%AA%E5%B1%8F2025-06-26%2011.18.59.png) | ![Play](https://file.web.hlingsoft.com/DPBatHp8K42r6qc0hWHW5if7FfmEtpHg/%E6%88%AA%E5%B1%8F2025-06-26%2011.16.08.png) | ![API](https://file.web.hlingsoft.com/lKilFV9MR3r6flvFCPVlcquvvHyb0fL7/%E6%88%AA%E5%B1%8F2025-07-26%2014.46.22.png) | ![Minimal](https://file.web.hlingsoft.com/Oos0WK5b76heWyUwH2zTVhOgHBB5BPYf/%E6%88%AA%E5%B1%8F2025-07-26%2014.45.27.png) |

---

## 📱  Join our community

Join our community to share ideas, get support, and collaborate with other users:



<img src="https://file.web.hlingsoft.com/HK8AYmIErpERLFQTqJN3LSTe6KEt1T8H/torra.jpg" alt="微信群二维码" width="200" />



---


## 📱   API Keys

Need free keys for OpenAI, Claude, DeepSeek, Keling, Jimeng, Sora, Flux, Minimax, ElevenLabs, etc.?  
Scan and add the author on WeChat:

<img src="https://file.web.hlingsoft.com/6hMSdEMQ6cCDCCWmReDNcEL63gW0UAap/WechatIMG1891.jpg" alt="author" width="200" />

---

## ⚙️ Requirements
- **Node.js ≥ 20**
- **npm ≥ 10**
- **pnpm ≥ 10** (recommended)

Use [Volta](https://volta.sh) to manage Node versions if needed.
---

## ⚡ Getting Started

### One‑click (non‑developers)

1. Download [torra‑starter.zip](https://file.web.hlingsoft.com/maO3Mw0xynoVsmeBnRXqOzLBP1kmhDsA/torra-starter.zip)  
2. **Windows**: run `start.bat` · **macOS**: run `start.command`  
3. Browser opens <http://localhost:3000>

### Quick Start (developers)

```bash
npx create-torra-app my-app
cd my-app
pnpm dev                 # uses SQLite

```

#### Switch to MongoDB


```bash

# .env
TORRA_DATASOURCE=cloud
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/torra

```
## 📄 License
MIT License — please retain attribution.

## 🙌 Acknowledgment
Created and maintained by the Torra Team.
Online demo → https://www.torra.cloud — please ⭐ Star us on GitHub!
