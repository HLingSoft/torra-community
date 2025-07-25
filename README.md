# Torra Community Edition

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

> **Built with Nuxt 4 (latest). All packages are kept up‑to‑date.**

**Torra Community Edition** is an open‑source visual editor for building AI agents and workflows — inspired by **Coze** and **Langflow**, but entirely implemented with **Vue 3 + TypeScript**.

Unlike Coze (closed‑source) and Langflow (React + Python), Torra is powered by **Nuxt 4**, **VueFlow**, **Tailwind CSS v4**, **Shadcn UI**, **LangChain.js**, and **FeathersJS**, offering a modern, high‑performance experience.

---

## 🌟 What’s new in v0.6

| Feature | Description |
|---------|-------------|
| **SQLite & MongoDB** | Out‑of‑the‑box support for both back‑ends. |
| **Local ↔ Cloud Seamless Switch** | Toggle `TORRA_DATASOURCE=local | cloud` and Torra migrates data automatically. |
| **Full FeathersJS Hooks** | All CRUD operations (`find`, `get`, `create`, `patch`, `remove`) pass through configurable hooks for auth, rate‑limit, audit‑log, LiveQuery, etc. |
| **API‑Key Hub** | Scan the author’s WeChat QR to request free‑tier keys for leading LLM platforms (Keling / Jimeng / Sora / Flux / Minimax / ElevenLabs / …). |

---

## 🌐 Demo Video

[![Try it Online](https://file.web.hlingsoft.com/SN1tGlRFSFsCB2B4in87AeKxt6nGFRrY/torra_screenshot.png)](https://file.web.hlingsoft.com/70ccmgMsHhoo8TnCFBqRWhBiMXudgrem/%E9%A3%9E%E4%B9%A620250627-212754.mp4)

---

## ✨ Features

- 🚀 Visual workflow editor (VueFlow)
- 🎨 Modern UI (Tailwind CSS v4 + Shadcn UI)
- 🤖 Built‑in LangChain.js integration
- 🗂 **Pluggable storage**: SQLite for local prototyping, MongoDB for production
- 🔄 **Hot‑swap** local ↔ online with zero downtime
- 🪝 FeathersJS hook pipeline on every DB operation
- 🧠 Supports major LLMs: OpenAI, Anthropic, Google, DeepSeek, Qwen, …
- 📦 Connects to MySQL, PostgreSQL, Redis, Elasticsearch, files, URLs, APIs
- 🖼 Multimodal data: text · image · audio · video
- 🧪 Built‑in playground & one‑click API publishing
- 📊 Usage logging & billing
- 🌍 Multi‑language UI (English, 中文, 日本語, …)

### 🧩 Built‑in Modules

| Category | Count | Highlights |
|----------|-------|------------|
| Input | 3 | Chat Input, Text Input, API Input |
| Output | 2 | Chat Output, Text Output |
| Prompt | 1 | Prompt |
| Image | 2 | OpenAI Vision, Image Generation |
| Voice | 2 | OpenAI TTS, STT |
| Data Sources | 8 | API Request, Directory, File, MongoDB, SQL Query, URL, Webhook |
| Processing | 8 | Message ↔ Data, Filter, Combine, JSON Parser, Save to OSS |
| Models | 5 | Ollama, Anthropic, DeepSeek, OpenAI, Google |
| Vector Store | 1 | Milvus |
| Embeddings | 1 | OpenAI |
| Memory | 1 | Upstash Redis Chat Memory |
| Agent | 1 | Agent |
| Logic | 5 | If‑Else, Listen, Loop, Notify, Pass |
| Tools | 5 | Baidu Search, Google Search, Tavily, Calculator, Timezone |
| Helpers | 5 | ID Generator, Message Store, Structured Output, List Output, History |
| MCP | 3 | MCP HTTP, MCP SSE, MCP stdio |
| SubFlow | 1 | Workflow |
 

---

## 🖼 More Screenshots

| Nodes | Playground | API |
|-------|------------|-----|
| ![Nodes](https://file.web.hlingsoft.com/0A0hfGrrTIPm9scihpEaarogPnMAWhbO/%E6%88%AA%E5%B1%8F2025-06-26%2011.18.59.png) | ![Play](https://file.web.hlingsoft.com/DPBatHp8K42r6qc0hWHW5if7FfmEtpHg/%E6%88%AA%E5%B1%8F2025-06-26%2011.16.08.png) | ![API](https://file.web.hlingsoft.com/zIHhaij2H6tBbym8eap1aqar2svuQ0q7/%E6%88%AA%E5%B1%8F2025-06-26%2011.24.37.png) |

---

## 📱 Community & API Keys

Need free keys for OpenAI, Claude, DeepSeek, Keling, Jimeng, Sora, Flux, Minimax, ElevenLabs, etc.?  
Scan and add the author on WeChat:

![WeChat QR](https://file.web.hlingsoft.com/6hMSdEMQ6cCDCCWmReDNcEL63gW0UAap/WechatIMG1891.jpg)

---

## ⚙️ Requirements
- **Node.js ≥ 20**
- **npm ≥ 10**
- **pnpm ≥ 10** (recommended)

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

#### Switch to MongoDB

# .env
TORRA_DATASOURCE=cloud
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/torra

## 📄 License
MIT License — please retain attribution.

## 🙌 Acknowledgment
Created and maintained by the Torra Team.
Online demo → https://www.torra.cloud — please ⭐ Star us on GitHub!
