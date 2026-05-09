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

**共有**: そのサービスアカウントのメールアドレスに、スプレッドシートを **編集者** で共有する。

**毎回自動でやること**: `npm run shopee-sheet:bootstrap` が `scope` / `ledger` / `asin_attempts` タブの存在確認と、**1行目ヘッダの補正**を行う（データ行は消さない）。

その他（通知 Webhook、候補発掘用トークン等）は別 Secret で足す。

## workflow_dispatch

- 手動再実行用に `workflow_dispatch` を併設してよい。

## Actions の利用枠

- 無料枠・プライベートリポジトリの制限などは **GitHub 公式の最新ドキュメント**に従う（数値はここにベタ書きしない）。
