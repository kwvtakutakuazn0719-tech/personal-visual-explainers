---
title: Slack 通知（Amazon URL 中心）
---

## 方針（確定）

- **画像は Slack に送らない**（PNG 図解・`image` ブロックは使わない）。
- 代わりに **Amazon の商品 URL（`/dp/{ASIN}`）を mrkdwn のリンク**で送る。
- 本文に **通し番号・ブランド・商品名・発売開始日・ASIN** を並べ、最後に **「Amazon.jp で開く」** 一行。

## スプレッドシート

- `product_image_url` 列は **残してよいが通知条件には含めない**（将来・別用途用）。
- 重複整理は **`product_queue` 段階**で済ませ、Slack は確定行のみ。

## 実装

- `scripts/shopee-candidate-notify-product-ready.mjs` … 上記ブロック。
- `scripts/shopee-post-mock-report-slack.mjs` … 手動テスト用モック（同趣旨）。
