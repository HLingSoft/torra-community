# README.ja.md（日本語）

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

> **Nuxt 4 ベースの最新アーキテクチャによる AI エージェント／ワークフロー可視化エディタ。**

**Torra Community Edition** は、可視化ワークフロー領域で **n8n に次ぐ第 2 の選択肢**。**Coze と Langflow に着想**を得つつ、フロントからバックエンドまで **TypeScript・Vue 3・Nuxt 4** で実装しました。VueFlow + Tailwind v4 + shadcn/ui の軽量な UI、**FeathersJS** バックエンド、**LangChain.js** 連携を備え、セルフホストやエンタープライズ導入をスムーズにします。

- **Nuxt 4 + Vue 3 + TypeScript** スタック  
- **VueFlow** のビジュアル編集、**Tailwind CSS v4 + shadcn/ui** のモダン UI  
- フルスタック TypeScript：**FeathersJS** バックエンド + **LangChain.js** ランタイム  
- 複数 DB：SQLite / MySQL / MongoDB、ローカル ↔ クラウドのホットスワップ

**お知らせ：** **10 月中旬** に**メジャーアップデート**を予定。  
先行トライは [https://www.torra.cloud](https://www.torra.cloud) をチェック、またはユーザーグループにご参加ください。最新の更新情報やプレビューを共有します。

---

## ✨ 機能

- 🚀 ビジュアルワークフローエディタ（VueFlow）  
- 🎨 モダン UI（Tailwind CSS v4 + shadcn/ui）  
- 🤖 LangChain.js をネイティブ統合  
- 🗂 プラガブルなストレージ：既定は **SQLite**、任意で **MySQL / MongoDB**。リモート移行をワンクリック  
- 🔄 **ローカル ↔ クラウドのホットスワップ**（ゼロダウンタイム）  
- 🪝 すべての DB 操作に FeathersJS Hooks  
- 🧠 主要 LLM 対応：OpenAI, Anthropic, Google, DeepSeek, Qwen, …  
- 📦 MySQL / PostgreSQL / Redis / Elasticsearch / Files / URLs / APIs 連携  
- 🖼 マルチモーダル（テキスト・画像・音声・動画）  
- 🧪 組み込み Playground とワンクリック API 公開  
- 📊 利用状況ログ & 課金  
- 🌍 多言語 UI（English / 中文 / 日本語 / …）  
- ☁️ **SaaS 対応**：**Parse Platform** ベースのクラウド版

---

## 🧩 内蔵モジュール

> **Langflow / Dify / Coze** の基礎プラグインを**網羅**しつつ、さらに**拡張プラグインを継続追加**しています。  
> **モダリティ対応：**テキスト・**画像**・**音声**・**動画**。**モデル：**OpenAI / Anthropic / Google / DeepSeek / Qwen / Ollama ほか。

| カテゴリ          | 数/状態   | ハイライト                                                                       |
| ----------------- | --------- | -------------------------------------------------------------------------------- |
| Input             | 3         | Chat Input, Text Input, API Input                                                |
| Output            | 2         | Chat Output, Text Output                                                         |
| Prompt            | 1         | Prompt Builder                                                                    |
| Image             | 7         | GPT Image, Stable Diffusion, Flux, Runway, Seedream, Qwen, DALL·E 3             |
| 画像認識          | 5         | OpenAI Vision, Gemini, Qwen, Doubao, Zhipu                                       |
| 音声              | 6         | OpenAI TTS/STT, ElevenLabs, Minimax（今後さらに拡充予定）                         |
| 動画              | 9         | Kling, Sora, Pika, Runway, Vidu, Google Veo, Dreamina, Alibaba Wan, Hailuo      |
| データソース      | 9+        | API Request/Tool, ファイル（単/複数）, ディレクトリ, MongoDB, SQL, URL, Webhook  |
| Processing        | 11+       | メッセージ↔データ, フィルタ, 結合, JSON, 構造化↔データ, OSS/Cloud 保存          |
| モデル            | 9+        | OpenAI, Anthropic, Google, xAI, DeepSeek, Tongyi, Zhipu, Doubao, Ollama          |
| ベクターストア     | 1         | Milvus                                                                            |
| 埋め込み          | 1         | OpenAI Embedding                                                                  |
| メモリ            | 1         | Upstash Redis Memory                                                              |
| Agent             | 1         | Agent Node                                                                        |
| ロジック          | 5         | If-Else, Loop, Listen, Notify, Pass                                               |
| ツール            | 3         | Web Search, Tavily AI Search, Timezone                                            |
| ヘルパー          | 12+       | 各種 ID、セッション/ユーザー/ワークフロー/トレース、Tips、履歴/ストア、時間、リスト |
| MCP               | 3         | HTTP, SSE, stdio                                                                  |
| サブフロー        | 1         | Workflow（再利用可能フロー）                                                       |
| プラグイン        | 拡充中    | Markdown→WeChat, Simple Browser, Page Capture, File Marker — **続々登場予定**     |

_今後も Langflow / Dify / Coze と同等の基本機能を維持しつつ、追加プロバイダと高機能プラグインを継続提供します。_

---

## ☁️ SaaS 版 —— Parse ベース

**Torra Cloud** は **Parse Platform を基盤としたマルチテナント SaaS 版**です。チーム/企業利用に必要な運用機能を標準装備：

- **マルチテナント**（組織・プロジェクト）とテナント分離  
- **RBAC と SSO**（OAuth / OIDC）、API キー（BYOK 対応）  
- **プラン/クォータ/メータリング**：エージェント数・実行数・トークン・ストレージ・Webhook 等  
- **課金と請求書**（Stripe 対応）、利用量ベースのレート制御  
- **監査ログとコンプライアンス**：リクエスト/レスポンスのマスキング、エクスポート、保持ポリシー  
- **Webhook / イベント駆動**、CI/CD・MLOps 連携；LiveQuery によるストリーミング  
- **ゼロダウンタイム移行** とロールバック、ブルーグリーンリリース  
- **オブザーバビリティ**：ワークフロー単位のトレース/メトリクス/構造化ログ  

---

## 📱  コミュニティに参加

アイデア共有・サポート・コラボのために、ぜひご参加ください：

<img src="https://file.web.hlingsoft.com/HK8AYmIErpERLFQTqJN3LSTe6KEt1T8H/torra.jpg" alt="WeChat グループ QR" width="200" />

---

## 🧾 追加ハイライト

- 📅 **完全なランタイム**：DB・認証・実行基盤・ログ・課金・多言語 UI を **Day 1** から提供。  
- 🖥 **充実のバックエンド**：**FeathersJS** による認証/権限、データ操作、ログ、LiveQuery、プラグイン Hooks。  
- 🧑‍💻 **100% オープンソース**：フロント/サーバー共に **MIT** ライセンスでベンダーロックインなし。  
- 🧩 **フルスタック TypeScript**：Nuxt 4 + FeathersJS + LangChain.js により、エンタープライズ統合が容易。  
- 🧠 **LangChain & LangGraph サポート**：**LangChain.js** と互換、**LangGraph** を順次統合。

---
