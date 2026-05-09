---
title: 商品パイプライン（簡潔版・正本）
---

## 欲しいもの

**新着（または追跡中）の1商品について**、次が揃った状態で **Slack に1回だけ** 届くこと。

- 通し番号（`product_queue.seq`）
- ブランド
- 商品名
- 発売開始日
- 商品画像（URL）
- ASIN

**1つでも欠けたら Slack は送らない**（ノイズ防止）。

## フェーズ（考え方）

1. **採取** … 各サイトの新着 → スプシ `product_queue` に行追加。**ブランド＋商品名**で重複は捨てる。ニューカラー／派生は別行（別キー）。
2. **見張り** … Amazon にまだ無い期間も **毎日ジョブ**。ASIN 空のまま一覧を維持・更新。
3. **初出品** … ある日 Amazon に出たら **ASIN と画像を埋める**（PA-API 等）。
4. **通知** … 上の6項目が **すべて埋まり**、かつ **未通知**（`slack_notified_at` 空）のとき **初めて Slack** → 通知後に `slack_notified_at` を記録。

## スプレッドシート

- **`product_queue`** … 上記の「一覧・見張り・通知ゲート」の主戦場（`scope` / `ledger` と役割分担）。

## 試験（NOVABLAST 5 SUNNY SIZZLE）

1. `npm run shopee-sheet:bootstrap`（`product_queue` タブ＋ヘッダ）
2. `npm run shopee-candidate:seed-novablast-spike` → `npm run shopee-candidate:notify-product-ready`  
   または `npm run shopee-candidate:spike-novablast` 一発。GitHub なら **Actions → `shopee-candidate-spike-novablast` → Run workflow**。

- 既定 ASINは **Amazon.jp の NOVABLAST 5 メンズ代表（`B0FNBNQ634`）**。SUNNY SIZZLE 専用でなければ **Secret `SPIKE_NOVABLAST_ASIN`**（またはローカルの同名 env）で差し替え。
- **Slack に届く条件**: `product_image_url` が空だと **通知しない**。PA-API Secrets があると seed が画像 URL を自動埋め。**無い場合は**スプシの `product_image_url` に Amazon 画像の `https://` URL を手で貼る。

## いまのコードとの位置づけ

- **`scope` / `ledger` / 毎朝 digest`** … 従来の調査取り込み用（途中経過も Slack に出る）。
- **`product_queue` + `notify-product-ready`** … あなたの **「揃ったら1回だけ Slack」** に寄せた土台。今後、採取・見張りロジックをここに寄せていく。
