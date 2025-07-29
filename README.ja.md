
# Torra Community Edition

🌐 [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

> **最新の Nuxt 4 を使用して構築。すべてのパッケージは常に最新に保たれています。**

**Torra Community Edition** は、AIエージェントとワークフローを構築するためのオープンソースのビジュアルエディターです。**Coze** や **Langflow** に着想を得ながらも、すべて **Vue 3 + TypeScript** で実装されています。

**Coze Studio**（React + Go）や **Langflow**（React + Python）とは異なり、**Torra** は **Nuxt 4**、**VueFlow**、**Tailwind CSS v4**、**Shadcn UI**、**LangChain.js**、**FeathersJS** を採用し、**軽量かつ本番環境対応のスタック** を提供。**エンタープライズ向けにスムーズな導入**が可能で、フルスタックTypeScript、デフォルトでのセルフホスティング、多言語UI、内蔵のランタイムによって企業環境への迅速な統合が実現できます。

---

## 🌟 v0.6 の新機能

| 機能 | 説明 |
|------|------|
| **SQLite / MySQL / MongoDB** | SQLite（開発用）、MySQL（本番環境）、MongoDB（柔軟な用途）に対応したバックエンドサポートを内蔵。 |
| **ローカル ↔ クラウド 無停止切替** | `TORRA_DATASOURCE` を `local` / `cloud` に変更するだけで自動移行。 |
| **FeathersJS フックパイプライン** | 全 CRUD 操作をカスタムフックで拡張でき、認証・レート制限・監査ログなども簡単。 |
| **GraphQL-style API Schema** | Declarative, flexible querying of workflow data. Simplifies frontend‑only development – no need to write custom backend endpoints. |

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

| カテゴリ            | 数量  | 注目コンポーネント・機能                               |
| --------------- | --- | ------------------------------------------ |
| 入力（Input）       | 3   | チャット入力、テキスト入力、API入力                        |
| 出力（Output）      | 2   | チャット出力、テキスト出力                              |
| プロンプト           | 1   | Promptビルダー                                 |
| 画像生成            | 5   | DALL·E 3、GPT画像、Stable Diffusion、OpenArt など |
| 画像認識            | 1   | OpenAIビジョン                                 |
| 音声関連            | 5   | OpenAI音声合成/認識、ElevenLabs、Minimax           |
| 動画生成            | 1   | Replicate Klingによるビデオ生成                    |
| データソース          | 9   | APIリクエスト、ファイル/ディレクトリ、MongoDB、SQL、Webhook等  |
| データ処理           | 11+ | メッセージ↔データ変換、フィルター、統合、JSON、ファイル保存など         |
| モデル             | 5   | OpenAI、DeepSeek、Anthropic、Google、Ollama    |
| ベクトルストア         | 1   | Milvus                                     |
| 埋め込み（Embedding） | 1   | OpenAI埋め込み                                 |
| メモリー管理          | 1   | Upstash Redisチャットメモリ                       |
| エージェント          | 1   | AIエージェントノード                                |
| ロジック制御          | 5   | 条件分岐、リッスン、ループ、通知、通過                        |
| ツール             | 5   | Google/Baidu検索、Tavily、電卓、タイムゾーン変換          |
| ヘルパー            | 7   | ID生成、メッセージ履歴、構造化出力、音声/映像の長さ計測など            |
| MCP             | 3   | HTTP、SSE、Stdio                             |
| サブフロー           | 1   | ワークフローの再利用ノード                              |
| プラグイン           | —   | プラグイン対応機能は開発中                              |


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
 


 ## ⚡ はじめに

リポジトリをクローンし、環境チェックスクリプトを実行：

```bash
git clone https://github.com/HLingSoft/torra-community.git
cd torra-community
chmod +x check_and_setup.sh
./check_and_setup.sh

```

- スクリプトは必要な依存関係（Node.js ≥20、npm >10、pnpm >10、SQLite、MongoDB、MySQL）の有無とバージョンをチェックし、開発サーバーを起動します。
- ブラウザが自動的に <http://localhost:3000> を開きます。

---

Happy hacking! 🚀

## 📄 ライセンス
MIT ライセンス。著作権表記を削除しないでください。



## 🙌 謝辞
Torra Team が開発・保守。
オンラインデモ → https://www.torra.cloud
気に入ったら GitHub で ⭐Star！
