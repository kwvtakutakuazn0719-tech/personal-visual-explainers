---
title: GitHub Actions schedule (pointers)
---

# GitHub Actions（主キック）

## 目的

毎日 **06:00 JST** にワークフローを起動し、スキルに沿った「調査ラン」をキックする。

## 公式ドキュメント（正本）

- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows — `schedule`](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

## cron とタイムゾーン

- `schedule` の `cron` は **UTC** を基準に解釈される。
- **JST 06:00** に相当する UTC 時刻へ換算して `cron` を書く（例: JST は UTC+9 のため、JST 06:00 は前日の **21:00 UTC**）。

## Secrets（ブートストラップ用・リポジトリに登録）

ワークフロー [`.github/workflows/shopee-candidate-discovery-daily.yml`](../../../../.github/workflows/shopee-candidate-discovery-daily.yml) が参照する名前:

| Secret 名 | 内容 |
|-----------|------|
| `SPREADSHEET_ID` | 対象ブックの ID（URL の `/d/` と次の `/` の間） |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Cloud の **サービスアカウント鍵 JSON を1本の文字列**として貼る（改行含めて可） |
| `AMAZON_PA_API_ACCESS_KEY` | （任意）Product Advertising API 5.0 のアクセスキー。`scope.amazon_keywords` からの自動 ASIN 突合に使用。 |
| `AMAZON_PA_API_SECRET_KEY` | （任意）上に対応するシークレットキー。 |
| `AMAZON_ASSOCIATES_PARTNER_TAG` | （任意）アソシエイトのストアID（日本向け例: `mysite-22`）。PA-API では必須。 |
| `SLACK_WEBHOOK_URL` | （任意）[Slack Incoming Webhook](https://api.slack.com/messaging/webhooks) の URL。朝レポートを投稿。 |
| `JINA_API_KEY` | （任意）[Jina Reader](https://r.jina.ai/docs) の Bearer トークン。無くても Reader は呼べるが、レートが厳しい場合に設定。詳細は `references/jina-reader.md`。 |
| `SPIKE_NOVABLAST_ASIN` | （任意）試験ワークフロー `shopee-candidate-spike-novablast` 用。省略時はスクリプト既定の ASIN。 |

**共有**: そのサービスアカウントのメールアドレスに、スプレッドシートを **編集者** で共有する。

**毎回自動でやること**:

1. `npm run shopee-sheet:bootstrap` … `scope` / `ledger` / `asin_attempts` タブの存在確認と **1行目ヘッダの補正**（データ行は消さない）。
2. `npm run shopee-candidate:discover-from-scope` … **`scope` → `ledger`**（未登録の `source_url` のみ）。Amazon 直リンクなら ASIN 抽出。**Jina Reader**（`https://r.jina.ai/{url}`）で非 Amazon 商品 URL の本文を取得し、`amazon_keywords` が空なら **ブランド＋タイトルから PA-API 用クエリを推測**（`JINA_API_KEY` 任意）。`amazon_keywords` または推測クエリ ＋ PA-API Secrets なら **SearchItems 先頭ヒット**（`asin_review=pending`）。実装: `scripts/shopee-candidate-discover-from-scope.mjs` / `scripts/lib/jina-reader.mjs`。
3. `npm run shopee-candidate:daily-digest` … **当日 JST の `discovered_at` 行**を集約し、PA-API でタイトル・画像を付けて **GitHub Job Summary** と **Slack（任意）** に出す。実装: `scripts/shopee-candidate-daily-digest.mjs`。

**注意（PA-API）**: 公式に **2026-05-15 で PA-API 廃止予定**とあり、**Creators API** への移行が案内されている。中長期は Creators API または SP-API 側の設計に寄せること。

## workflow_dispatch

- 手動再実行用に `workflow_dispatch` を併設してよい。

## Actions の利用枠

- 無料枠・プライベートリポジトリの制限などは **GitHub 公式の最新ドキュメント**に従う（数値はここにベタ書きしない）。
