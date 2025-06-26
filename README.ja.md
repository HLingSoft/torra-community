# Torra コミュニティ版

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

**Torra コミュニティ版** は、AI エージェントとワークフローを構築するためのオープンソースのビジュアルエディタです。**Coze** や **Langflow** にインスパイアされ、**Vue + TypeScript** によって完全に構築されています。

Coze（クローズドソース）や Langflow（React + Python）とは異なり、Torra は **Nuxt3**、**VueFlow**、**Tailwind CSS v4**、**Shadcn UI**、**LangChain.js** を使用し、開発者とチームにモダンで高性能な体験を提供します。

このエディションは無料で使用・変更・拡張が可能です。

![メインスクリーンショット](https://file.web.hlingsoft.com/26NbxPHeTGXNCO23MhsEXb5yE82VUo6d/screenshot.png)

---

## ✨ 主な機能

- 🚀 VueFlow による視覚的なワークフローエディタ
- 🎨 Tailwind CSS v4 + Shadcn を採用したモダンな UI
- 🤖 LangChain.js 統合による LLM ワークフロー構築
- 🗂 ローカルファーストストレージ（クラウドロックインなし）
- ⚡ 素早いプロトタイピングと拡張のしやすさ
- 🔓 完全オープンソースでコミュニティに優しい
- 🧠 主要な LLM をサポート：OpenAI、Anthropic、Google、DeepSeek、Qwen など
- 🗃 多様なデータソース：MySQL、PostgreSQL、MongoDB、SQLite、Redis、Elasticsearch
- 📄 多様なデータ形式対応：CSV、JSON、XML、YAML
- 🔧 データのクレンジング、変換、分析、可視化に対応
- 🛢 柔軟なバックエンド：ローカルファイル、クラウド、データベース
- 🔍 SQL、NoSQL、GraphQL でのクエリが可能
- 🖼 テキスト、画像、音声、動画のマルチモーダルデータ対応
- 🧪 エージェントテスト・デバッグ用 Playground 搭載
- 🚀 ワンクリックで API 公開
- 📊 LLM 利用のロギングと課金管理
- 🌍 多言語 UI 対応（英語・中国語・日本語 など）

### 🧩 組み込みモジュールと機能一覧

| モジュール    | 数量 | 機能一覧                                                                 |
|---------------|------|--------------------------------------------------------------------------|
| 入力          | 3    | チャット入力、テキスト入力、API 入力                                   |
| 出力          | 2    | チャット出力、テキスト出力                                              |
| プロンプト     | 1    | プロンプト                                                               |
| 画像          | 2    | OpenAI 画像認識、OpenAI 画像生成                                        |
| 音声          | 2    | OpenAI 音声認識、OpenAI 音声生成                                        |
| データソース  | 8    | API リクエスト、API ツール、ディレクトリ、ファイル、MongoDB、SQL クエリ、URL、Webhook |
| データ処理    | 8    | メッセージからデータ、データからメッセージ、データフィルタ、データ統合、構造化→データ、データ→構造化、JSON パーサー、ファイルを Aliyun に保存 |
| モデル        | 5    | Ollama、Anthropic、DeepSeek、OpenAI、Google                              |
| ベクトルストア| 1    | Milvus                                                                   |
| 埋め込み       | 1    | OpenAI                                                                   |
| チャット記憶   | 1    | Upstash Redis チャットメモリ                                           |
| エージェント   | 1    | エージェント                                                             |
| ロジック       | 5    | If-Else、Listen、Loop、Notify、Pass                                     |
| ツール         | 5    | Baidu 検索、計算機、Google 検索、Tavily AI 検索、タイムゾーン / 位置情報  |
| ヘルパー       | 5    | ID 生成器、メッセージ履歴、メッセージストア、構造化出力、リスト出力     |
| MCP           | 3    | MCP HTTP ツール、MCP SSE ツール、MCP stdio ツール                        |
| サブフロー     | 1    | ワークフロー（Workflow）                                                 |
| プラグイン     | 0    | Comming Soon                                                                          |

---

## 🖼 スクリーンショット

| スクリーンショット 1 | スクリーンショット 2 | スクリーンショット 3 |
|----------------------|----------------------|----------------------|
| ![1](https://file.web.hlingsoft.com/0A0hfGrrTIPm9scihpEaarogPnMAWhbO/%E6%88%AA%E5%B1%8F2025-06-26%2011.18.59.png) | ![2](https://file.web.hlingsoft.com/DPBatHp8K42r6qc0hWHW5if7FfmEtpHg/%E6%88%AA%E5%B1%8F2025-06-26%2011.16.08.png) | ![3](https://file.web.hlingsoft.com/zIHhaij2H6tBbym8eap1aqar2svuQ0q7/%E6%88%AA%E5%B1%8F2025-06-26%2011.24.37.png) |

---
 

## ⚙️ システム要件

- **Node.js ≥ 20**
- **npm ≥ 10**
- **pnpm ≥ 10**（推奨）

> ⚠️ Node バージョン管理には [nvm](https://github.com/nvm-sh/nvm) の利用を推奨します。

---

## ⚡ はじめに

### 🏁 クイックスタート（推奨）

```bash
npx create-torra-app my-app
cd my-app
pnpm dev
```

### 🛠 手動セットアップ

```bash
npm i -g pnpm
git clone https://github.com/HLingSoft/torra-community.git
cd torra-community
pnpm install
pnpm dev
```

---

## 📄 ライセンス

このプロジェクトは [MIT ライセンス](./LICENSE) に基づいてオープンソース化されています。

> 本プロジェクトを使用・修正・再配布する際は、  
> 元のライセンスを保持し、**Torra チーム** を明記してください。

---

## 🙌 クレジット

本プロジェクトは **Torra チーム** によって作成・保守されています。  
オンラインで試す 👉 [https://www.torra.cloud](https://www.torra.cloud)

💬 フィードバックや提案は [GitHub Issue](https://github.com/HLingSoft/torra-community/issues) にて歓迎します。  
💖 役に立ったと思ったら GitHub のスター ⭐ をお願いします！
