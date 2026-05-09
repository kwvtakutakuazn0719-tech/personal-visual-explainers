---
title: SP-API / Shopee API pointers
---

# API の位置づけ（詳細は公式へ）

## Amazon Selling Partner API

- **Catalog Items** 等: 候補特定**後**の **ASIN / カタログ属性の解決**に使う想定。
- ロール・レート・マーケットプレイスは [SP-API 公式](https://developer-docs.amazon.com/sp-api/) を参照。

## Product Advertising API 5.0（PA-API）— リポジトリ内の用途

- 毎朝ジョブで **`scope.amazon_keywords` → SearchItems → ASIN`** と、ダイジェスト用 **`GetItems`（タイトル・画像）** に利用する（実装は `scripts/lib/amazon-paapi-jp.mjs`）。
- **廃止予定**: 公式に **2026-05-15** と記載あり。**[Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction)** への移行を中長期で検討すること（細目は公式のみを正本とする）。

## Shopee Open Platform

- 自店の出品一覧などは **Product 系 API** のパターンが一般的。詳細は Shopee Developer Guide を参照。

このファイルにエンドポイントや数値をベタ書きしない（SSoT 監査）。
