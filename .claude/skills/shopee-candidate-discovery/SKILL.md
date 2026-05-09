---
name: shopee-candidate-discovery
description: >-
  Shopee出品の新規候補を多ソースで発掘し、スプレッドシート台帳（SSOT）に追記・更新し、ASINの突合と再探索ルールで運用するスキル。
  「出品候補を調査して」「売れそうな新商品を探して」「ASINを集めて」「候補台帳を更新して」「毎朝6時の調査を回したい」と依頼された際に使用する。
---

# Shopee Candidate Discovery

Shopeeで出品する新たな商品候補を発掘し、**Googleスプレッドシート（台帳）をSSOT**として更新する。

## 重要な前提（最初に読む）

- **このスキルは手順書**。単体で毎日06:00に自動実行はしない。
- **定期キックの主シナリオは GitHub Actions**。実行時刻は **毎日 06:00 JST** を正本とする（詳細は `references/` を参照）。
- **スプシの形（タブ名・1行目ヘッダ）は自動維持できる**: `npm run shopee-sheet:bootstrap`（`scripts/shopee-candidate-sheet-bootstrap.mjs`）を Actions から毎回実行する。
- **朝の自動パイプライン（GitHub Actions）**: `bootstrap` → **`scope`→`ledger` 取り込み**（`npm run shopee-candidate:discover-from-scope`）→ **当日分ダイジェスト**（`npm run shopee-candidate:daily-digest`）。ダイジェストは **Job Summary** と任意の **Slack Webhook**。詳細は `references/github-actions-schedule.md`。
- **Amazon 自動突合（機械）**: `source_url` が Amazon 直リンクなら ASIN 抽出。ブログ等の URL と別に、列 **`amazon_keywords`** に検索語を入れ **PA-API SearchItems** で先頭 ASIN を入れる（Secrets 要）。**誤突合があり得る**ため `asin_review=pending` を正とする。
- **ASINが適切かの最終判断は人間ゲート**（同一ASINでもバリアント違い等があるため）。

## 依存（正本）

作業前に必要に応じて読む（詳細は各 `references/` が正本）。

- `references/ledger-schema.md` — 台帳の列（必須/推奨/拡張）と意味
- `references/workflow-states.md` — ステータス遷移、再調査・再探索、打ち切りルール
- `references/schedule.md` — 毎日06:00 JST の運用方針
- `references/github-actions-schedule.md` — GitHub Actions の `schedule` / `workflow_dispatch` / Secrets の扱い（公式リンク中心）
- `references/source-register-template.md` — 情報源URLレジストリのテンプレ
- `references/source-risks.md` — 安定性/壊れやすさ/規約・ログイン壁の整理
- `references/sp-api-pointer.md` — SP-API / Shopee API の位置づけ（リンク集）
- `references/spike-amazon-jp.md` — Amazon.co.jp 突合の短い検証（スパイク）
- `references/jina-reader.md` — Jina Reader（r.jina.ai）の呼び方・Secrets・注意
- `references/product-pipeline-concise.md` — **新着→見張り→Amazon初出品→Slack（揃ったときだけ）** の全体像（簡潔版）
- `references/slack-report-visual-spec.md` — Slack **図解1枚長尺**のレイアウト・配色（確定案）

## 入力（あなたが用意するもの）

- **スプレッドシート**: `scope`（調査スコープ）と `ledger`（台帳SSOT）。将来 `asin_attempts`（試行ログ）を追加してよい。  
  **雛形CSV**（列付き）: リポジトリの [`templates/shopee-candidate-spreadsheet/`](../../../templates/shopee-candidate-spreadsheet/README.md) を Google スプレッドシートにインポートして作成する（エージェントはあなたの Google アカウント上に直接ファイルを作れない）。
- **調査スコープ**: 小カテゴリ、主ブランド、見るべきURL（公式・ブログ・EC等）。
- **通知の受け口**（任意）: Slack等。スキルは「報告に含める項目」を規定し、送信自体は環境に委譲する。

## 成果物（毎回のアウトプット）

- 台帳 `ledger` の **新規行追加** または **既存行更新**
- **毎朝 06:00 JST（Actions）**: 当日分の **ledger ダイジェスト**（タイトル・任意で画像・ASIN・根拠リンク）。Slack を入れていれば同内容を投稿。
- エージェントが手で書く完了報告（任意・補足）:
  - **人間レビューが必要な点**（例: PA-API 先頭1件がバリアント違いの疑い）

## ワークフロー（毎日06:00の調査ラン）

### Step 1: 今日の調査スコープを読む

`scope` を読み、今日見るカテゴリ・ブランド・URL群を確定する。

### Step 2: 多ソースで候補を発掘する

優先シグナル:

- **新商品トレンド**（新作・新ライン・発売予定）
- **ブログ/SNS/レビュー**（話題 or 高評価レビューが濃い）
- **（低優先）Shopee側の売上シグナル**（取得可能なら）

各候補について最低限そろえる:

- 候補名（仮で可）
- 根拠URL
- 何がシグナルか（新商品/レビュー/話題/周辺品）
- 信頼度メモ（なぜ信用できるか、弱点は何か）

### Step 3: 台帳に追記する（SSOT更新）

`ledger` に行を追加（未登録なら）または更新（既存なら）。

### Step 4: Amazon.co.jp を突合する（ASIN取得）

- **自動**: 直リンクの ASIN 抽出、または `amazon_keywords` ＋ PA-API の先頭ヒット。
- **人間**: ASINの適合は **`asin_review=pending`** を起点に、採否だけを朝に更新する。

### Step 5: 人間ゲート（採用/却下）を台帳で回す

あなたが朝に `asin_review` を更新する。

- **approved**: 出品パイプラインへ
- **rejected**: 「別ASINを再探索」を起動する（週次）

### Step 6: 却下→別ASIN再探索（週次・1か月で停止）

却下のときは `workflow-states.md` の正本に従い:

- **1週間後に別のASINを再探索**
- **初回却下日から1か月**経過したら打ち切り

## 禁止・注意

- 取得方法は `source-risks.md` の方針に従い、**規約リスクが高い手段を勝手に拡大しない**。
- APIのレートや細目をこのファイルにベタ書きしない（`sp-api-pointer.md` に集約）。

