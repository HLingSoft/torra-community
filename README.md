# README.md (English)

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

> **A modern, Nuxt 4–powered visual editor for AI agents & workflows.**

**Torra Community Edition** is the **second option after n8n** for visual, production-ready AI workflows — **inspired by Coze and Langflow**, but implemented end-to-end with **TypeScript, Vue 3, and Nuxt 4**. Torra pairs a lightweight UI with a full FeathersJS backend and LangChain.js integrations, giving you a clean, enterprise-friendly stack that’s easy to self-host and scale.

- Built with **Nuxt 4 + Vue 3 + TypeScript**
- Visual editor via **VueFlow**, modern UI with **Tailwind CSS v4 + shadcn/ui**
- Full-stack TypeScript with **FeathersJS** backend and **LangChain.js** runtime
- Multi-DB: SQLite / MySQL / MongoDB, hot-swap local ↔ cloud

**Heads-up:** A **major release is coming in mid-October**.  
Want early access? Try it now at [https://www.torra.cloud](https://www.torra.cloud) or join our user group — we share iteration notes and previews there.

---

## ✨ Features

- 🚀 Visual workflow editor (VueFlow)  
- 🎨 Modern UI (Tailwind CSS v4 + shadcn/ui)  
- 🤖 Built-in LangChain.js integration  
- 🗂 Pluggable storage: default local **SQLite**, optional **MySQL** or **MongoDB**, with one-click migration to remote MongoDB/MySQL  
- 🔄 **Hot-swap** local ↔ online with zero downtime  
- 🪝 FeathersJS hook pipeline on every DB operation  
- 🧠 Supports major LLMs: OpenAI, Anthropic, Google, DeepSeek, Qwen, …  
- 📦 Connects to MySQL, PostgreSQL, Redis, Elasticsearch, files, URLs, APIs  
- 🖼 Multimodal data: text · image · audio · video  
- 🧪 Built-in playground & one-click API publishing  
- 📊 Usage logging & billing  
- 🌍 Multi-language UI (English, 中文, 日本語, …)  
- ☁️ **SaaS-ready**: Cloud edition built on **Parse Platform**

---

## 🧩 Built-in Modules

> **Core parity with Langflow / Dify / Coze** for the foundational nodes you expect — plus an expanding library of advanced plugins.  
> **Modalities covered:** Text • **Image** • **Audio** • **Video**. **Models:** OpenAI, Anthropic, Google, DeepSeek, Qwen, Ollama, …

| Category          | Count/Status | Highlights                                                                 |
| ----------------- | ------------ | -------------------------------------------------------------------------- |
| Input             | 3            | Chat Input, Text Input, API Input                                          |
| Output            | 2            | Chat Output, Text Output                                                   |
| Prompt            | 1            | Prompt Builder                                                             |
| Image             | 7            | GPT Image, Stable Diffusion, Flux, Runway, Seedream, Qwen, DALL·E 3        |
| Image Recognition | 5            | OpenAI Vision, Gemini, Qwen, Doubao, Zhipu                                 |
| Voice             | 6            | OpenAI TTS/STT, ElevenLabs, Minimax (more engines planned)                 |
| Video             | 9            | Kling, Sora, Pika, Runway, Vidu, Google Veo, Dreamina, Alibaba Wan, Hailuo |
| Data Sources      | 9+           | API Request/Tool, File(s), Directory, MongoDB, SQL, URL, Webhook           |
| Processing        | 11+          | Msg↔Data, Filters, Combine, JSON, Structured↔Data, Save to OSS/Cloud       |
| Models            | 9+           | OpenAI, Anthropic, Google, xAI, DeepSeek, Tongyi, Zhipu, Doubao, Ollama    |
| Vector Store      | 1            | Milvus                                                                     |
| Embeddings        | 1            | OpenAI Embedding                                                           |
| Memory            | 1            | Upstash Redis Memory                                                       |
| Agent             | 1            | Agent Node                                                                 |
| Logic             | 5            | If-Else, Loop, Listen, Notify, Pass                                        |
| Tools             | 3            | Web Search, Tavily AI Search, Timezone                                     |
| Helpers           | 12+          | IDs, Session/User/Workflow/Trace, Tips, History/Store, Durations, Lists    |
| MCP               | 3            | HTTP, SSE, stdio                                                           |
| SubFlow           | 1            | Workflow (Reusable Flow)                                                   |
| Plugins           | Growing      | Markdown→WeChat, Simple Browser, Page Capture, File Marker — **more coming** |

_We continuously add new modules/providers to keep parity **and** ship extras beyond Langflow / Dify / Coze._

---

## ☁️ SaaS Edition — Parse-based

**Torra Cloud** is a fully managed **SaaS edition built on Parse Platform**, designed for teams that want instant multi-tenant hosting with enterprise controls:

- **Multi-tenant org/projects** with per-tenant isolation  
- **RBAC & SSO** (OAuth/OIDC) and API keys (BYOK supported)  
- **Plans, quotas, metering** for agents, runs, tokens, storage, and webhooks  
- **Billing & invoices** (Stripe-ready) with usage-based rate limiting  
- **Audit logs & compliance**: request/response redaction, export, retention policies  
- **Webhooks & events** for CI/CD and MLOps; LiveQuery streaming  
- **Zero-downtime migrations** and rollbacks; blue-green releases  
- **Observability**: traces, metrics, structured logs across workflows  

Try Torra Cloud at [https://www.torra.cloud](https://www.torra.cloud) or join our user group to receive iteration updates and previews.

---

## 📱  Join our community

Join our community to share ideas, get support, and collaborate with other users:

<img src="https://file.web.hlingsoft.com/HK8AYmIErpERLFQTqJN3LSTe6KEt1T8H/torra.jpg" alt="WeChat Group QR" width="200" />

---

## 🧾 Additional Highlights

- 📅 **Complete Runtime**: Day-1 ready — database, auth, workflow runtime, logging, billing, multi-language UI.  
- 🖥 **Fully-featured Backend**: FeathersJS system with auth, roles, data ops, logs, LiveQuery, and plugin hooks.  
- 🧑‍💻 **100% Open Source**: Client + server under **MIT License** — no vendor lock-in.  
- 🧩 **Full-stack TypeScript**: Nuxt 4 + FeathersJS + LangChain.js for enterprise-grade integration and onboarding.  
- 🧠 **LangChain & LangGraph**: Native **LangChain.js** support and progressive **LangGraph** integration.

---
