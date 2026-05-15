---
name: shopee-product-name-seo-aeo-review
description: Shopeeの商品名をSEO/AEO観点でレビューするスキル。「Shopee商品名をレビューして」「SEO/AEOチェックして」「商品名を点検して」と依頼された際や、Shopee図解フローの Step 4d で使用する。
---

# Shopee Product Name SEO / AEO Review

Shopee 出品欄に貼る **英語 1 行の商品名**を、SEO / AEO 観点でレビューする。  
**100文字ルール・構成順・コードブロック出力**は **`../shopee-explainer-common/references/shopee-product-listing-title.md`**、  
レビュー観点の本文は **`references/seo-aeo-rubric.md`** を正本とする。

## 依存

- `../shopee-explainer-common/references/shopee-product-listing-title.md`
- `references/seo-aeo-rubric.md`
- `../../../reference-data/shopee-trend-sheets/README.md`（外部表を使う場合のみ）

## 使いどころ

- Shopee 図解フローの **Step 4d** として、Step 4c の下書きを点検するとき
- ユーザーが **Shopee の商品名だけ**をレビュー・改善したいとき

## ワークフロー

### Step 0: 正本を読む

1. `../shopee-explainer-common/references/shopee-product-listing-title.md` を読む  
2. `references/seo-aeo-rubric.md` を読む

### Step 1: 入力を確認

レビュー対象として、少なくとも次を確認する:

- 下書きの商品名 1 行
- その商品が **何であるか**を示す調査メモ（ブランド、モデル、カテゴリ、用途など）
- ユーザーが Step 1 で渡した商品名の意図

不足がある場合:

- **Shopee 図解フロー内**なら、すでに集めた調査結果から補う
- **単独依頼**なら、不足情報を短く確認する

### Step 2: レビュー

`references/seo-aeo-rubric.md` に従って点検し、指摘を次の 2 つに分ける。

- **必須修正**  
  誤認、100字超過、ソース不整合、別 SKU と混同しうる語など
- **改版ヒント**  
  より短い共起語への置換、語順の改善、重複削減など

### Step 3: 出力

レビュー結果は、次の最小構成で返す。

```text
判定: pass | revise
必須修正:
- ...
改版ヒント:
- ...
```

- **問題なし**なら `必須修正: なし`
- ヒントがなければ `改版ヒント: なし`
- レビュー長文や冗長な解説は避ける

### Step 4: Shopee 図解フロー内で使うとき

- このスキルの結果は **内部ワークフロー用**として扱う
- レビュー結果をもとに **Step 4e** で商品名を組み直す
- 完了報告ではレビュー本文を出さず、**最終商品名だけ**を  
  `../shopee-explainer-common/references/shopee-generation-ssot.md` のテンプレどおり **コードブロック**で出す

## 守ること

- Shopee の**内部アルゴリズムを断定しない**
- ソースにない素材・用途・優位性を付け足さない
- 任意改善より **必須修正を優先**する
- 100字を超える場合は、`shopee-product-listing-title.md` の方針どおり **後ろの共起語から削る**
- 4c→4d→4e を **1 周**で終えるのを原則とし、争点が残る場合のみ **最大もう 1 周**
