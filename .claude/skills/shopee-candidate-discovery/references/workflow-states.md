---
title: Workflow states (SSOT)
---

# 状態遷移（正本）

## 概要

- 台帳 `ledger` が SSOT。
- **ASIN の適合は人間ゲート**（`asin_review`）。
- 却下の場合は **別 ASIN を週次で再探索**、ただし **初回却下から 1 か月**で打ち切る。

## 推奨ステータス（`status`）

- `new`: 発見直後（台帳に追加済み）
- `asin_pending`: ASIN 候補の記録はあるが、人間レビュー待ち（`asin_review=pending`）
- `approved`: ASIN 採用済み（出品パイプラインへ渡す）
- `rejected_asin_reseek`: ASIN 却下 → 別 ASIN 再探索待ち
- `stopped`: 打ち切り（理由がある）

ステータスは最小に保ち、詳細は列で表す（過度に増やさない）。

## ルール 1: Amazon 未掲載の再調査（ASIN が存在しない）

- 発見時点で Amazon に無い場合:
  - `next_amazon_recheck_at = discovered_at + 7d`（列を持つ場合）
  - 以後 **7 日ごと**に再チェック
  - `discovered_at + 30d` を超えても無いなら `stopped`（理由: `no_amazon_listing_30d` 等）

## ルール 2: ASIN 却下の再探索（別 ASIN を探す）

却下は「この ASIN が不適合」。候補自体は継続する。

- 却下時（朝に更新）:
  - `asin_review = rejected`
  - `asin_reject_reason` を記入
  - `first_reject_at` が空なら **初回却下日時**を入れる（以後は固定）
  - `next_asin_reseek_at = 今日 + 7d`
  - `asin_reseek_deadline = first_reject_at + 30d`
  - `status = rejected_asin_reseek`

- 週次再探索ラン（`next_asin_reseek_at` 到来）:
  - `asin_reseek_deadline` を超えていなければ、別 ASIN 候補を探し `current_asin` を更新
  - `asin_review = pending` に戻す（確認待ち）
  - `asin_reseek_attempts` を +1

- 打ち切り:
  - `asin_reseek_deadline` 超過なら `status = stopped`（理由: `asin_reseek_timeout`）

## 試行ログ（任意: `asin_attempts` シート）

将来の自動判定や監査のため、append-only のログを追加できる。

推奨列:

- `candidate_id`
- `attempt_no`
- `asin`
- `verdict`（approved / rejected）
- `reason`
- `checked_at`
- `checked_by`
