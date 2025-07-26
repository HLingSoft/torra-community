
# Torra Community Edition

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

> **最新 Nuxt 4 で構築。すべての依存パッケージは常に最新です。**

**Torra Community Edition** は AI エージェントとワークフローを可視的に構築できるオープンソースエディタです。  
**Coze** と **Langflow** にインスパイアされつつ、**Vue 3 + TypeScript** でゼロから実装しました。

Coze（クローズドソース）や Langflow（React + Python）とは異なり、Torra は **Nuxt 4**、**VueFlow**、**Tailwind CSS v4**、**Shadcn UI**、**LangChain.js**、**FeathersJS** を採用し、モダンで高速な開発体験を提供します。

---

## 🌟 v0.6 の新機能

| 機能 | 説明 |
|------|------|
| **SQLite / MySQL / MongoDB** | SQLite（開発用）、MySQL（本番環境）、MongoDB（柔軟な用途）に対応したバックエンドサポートを内蔵。 |
| **ローカル ↔ クラウド 無停止切替** | `TORRA_DATASOURCE` を `local` / `cloud` に変更するだけで自動移行。 |
| **FeathersJS フックパイプライン** | 全 CRUD 操作をカスタムフックで拡張でき、認証・レート制限・監査ログなども簡単。 |
| **API キーハブ** | 著者の WeChat QR をスキャンし、OpenAI・可灵・即梦・Sora・Flux・Minimax・ElevenLabs などの無料キーを取得。 |

---

## 🌐 デモ動画

[![オンライン体験](https://file.web.hlingsoft.com/SN1tGlRFSFsCB2B4in87AeKxt6nGFRrY/torra_screenshot.png)](https://file.web.hlingsoft.com/70ccmgMsHhoo8TnCFBqRWhBiMXudgrem/%E9%A3%9E%E4%B9%A620250627-212754.mp4)

---

## ✨ 特長

- 🚀 VueFlow によるドラッグ＆ドロップ編集
- 🎨 Tailwind CSS v4 + Shadcn UI のモダン UI
- 🤖 LangChain.js をネイティブ統合
- 🗂 プラグイン式ストレージ：デフォルトはローカル **SQLite**、任意で **MySQL** または **MongoDB** に切替可能。ワンクリックでオンラインDBに移行可能。
- 🔄 ローカル ↔ クラウド データシームレス移行
- 🪝 FeathersJS フックで認証・監査・リアルタイム拡張
- 🧠 OpenAI・Anthropic・Google・DeepSeek・Qwen などサポート
- 🖼 テキスト・画像・音声・動画などマルチモーダル対応
- 🧪 Playground と 1クリック API 公開
- 📊 LLM 使用量ログ & 課金
- 🌍 多言語 UI

### 🧩 内蔵モジュール

| カテゴリ | 数 | 代表機能 |
|----------|----|----------|
| Input | 3 | Chat Input、Text Input、API Input |
| Output | 2 | Chat Output、Text Output |
| Prompt | 1 | Prompt |
| Image | 2 | OpenAI 画像認識、画像生成 |
| Voice | 2 | OpenAI 音声認識、音声合成 |
| Data Sources | 8 | API Request、Directory、File、MongoDB、SQL Query、URL、Webhook |
| Processing | 8 | Message↔Data、Filter、Combine、JSON Parser、OSS へ保存 |
| Models | 5 | Ollama、Anthropic、DeepSeek、OpenAI、Google |
| Vector Store | 1 | Milvus |
| Embeddings | 1 | OpenAI |
| Memory | 1 | Upstash Redis Chat Memory |
| Agent | 1 | Agent |
| Logic | 5 | If‑Else、Listen、Loop、Notify、Pass |
| Tools | 5 | Baidu Search、Google Search、Tavily、Calculator、Timezone |
| Helpers | 5 | ID Generator、Message Store、Structured Output、List Output、History |
| MCP | 3 | MCP HTTP、MCP SSE、MCP stdio |
| SubFlow | 1 | Workflow |
| Plugins | 0 | 近日公開 |

---


## 🧾 その他の特長

- 📅 **完全なランタイムサポート**：データベース、認証、ワークフロー実行、ログ、課金、多言語UIなど、すべてが初日からすぐに使えます。
- 🖥 **フル機能のバックエンド**：FeathersJS による完全なバックエンドシステムを搭載。認証、ロール制御、データ操作、ログ、LiveQuery、プラグイン拡張に対応。
- 🧑‍💻 **100％オープンソース**：クライアントとサーバーのコードはすべて MIT ライセンスのもとで公開されており、ベンダーロックインはありません。
- 🧩 **フルスタック TypeScript**：Nuxt4 + FeathersJS + LangChain.js を用いたエンドツーエンドの TypeScript 開発により、企業レベルの統合とチーム導入が容易に。
- 🧠 **LangChain と LangGraph にネイティブ対応**：LangChain.js にすぐ対応可能で、LangGraph の段階的な統合も進行中。最新のエージェントアーキテクチャとコミュニティのベストプラクティスに準拠。


---


## 🖼 スクリーンショット

| ノード編集 | Playground | API 呼び出し | ミニマルモード |
|------------|------------|--------------|----------------|
| ![Nodes](https://file.web.hlingsoft.com/0A0hfGrrTIPm9scihpEaarogPnMAWhbO/%E6%88%AA%E5%B1%8F2025-06-26%2011.18.59.png) | ![Play](https://file.web.hlingsoft.com/DPBatHp8K42r6qc0hWHW5if7FfmEtpHg/%E6%88%AA%E5%B1%8F2025-06-26%2011.16.08.png) | ![API](https://file.web.hlingsoft.com/lKilFV9MR3r6flvFCPVlcquvvHyb0fL7/%E6%88%AA%E5%B1%8F2025-07-26%2014.46.22.png) | ![Minimal](https://file.web.hlingsoft.com/Oos0WK5b76heWyUwH2zTVhOgHBB5BPYf/%E6%88%AA%E5%B1%8F2025-07-26%2014.45.27.png) |

---
 


## ⚙️ 必要環境

- **Node.js ≥ 20**
- **npm ≥ 10**
- **pnpm ≥ 10**


> Node バージョン管理には [Volta](https://volta.sh) を推奨します。
---

## ⚡ クイックスタート

```bash
npx create-torra-app my-app
cd my-app
pnpm dev          # SQLite を使用

```

#### MongoDB に切り替え

# .env
TORRA_DATASOURCE=cloud
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/torra


## 📄 ライセンス
MIT ライセンス。著作権表記を削除しないでください。



## 🙌 謝辞
Torra Team が開発・保守。
オンラインデモ → https://www.torra.cloud
気に入ったら GitHub で ⭐Star！
