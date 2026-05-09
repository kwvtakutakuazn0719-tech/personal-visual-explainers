---
title: Ledger schema (SSOT)
---

# 台帳（`ledger`）の列案（正本）

目的: **1候補=1行**で、発見→ASIN突合→人間ゲート→週次再探索→打ち切りまで回す。

## 必須（最小）

- `candidate_id`: 内部キー（不変）
- `category`: 小カテゴリ（running / trailrunning 等、運用に合わせる）
- `brand`: ブランド
- `candidate_name`: 候補名（仮可）
- `source_url`: 根拠URL（最低1つ）
- `signal_type`: 根拠の種類（new_release / review / buzz / shopee_signal / other）
- `confidence_note`: 信頼度メモ（短文）
- `discovered_at`: 発見日時
- `status`: 行の状態（詳細は `workflow-states.md`）

## ASINゲート（今回の要件）

- `current_asin`: 現時点のASIN候補（空でも可）
- `asin_review`: `pending | approved | rejected`
- `asin_reject_reason`: 却下理由（短文）
- `first_reject_at`: 初回却下日時（**1か月ルールの起点**）
- `next_asin_reseek_at`: 次回ASIN再探索日（却下→+7日）
- `asin_reseek_deadline`: 打ち切り期限（`first_reject_at + 30d`）
- `asin_reseek_attempts`: 試行回数（任意）

## Amazon突合メモ（任意だが強い）

- `amazon_match_note`: 何で突合したか（型番/モデルコード/キーワード等）
- `model_code`: 型番・モデルコード（取れる範囲で）
- `variant_note`: 色/サイズ/パック数などの注意

## 運用メタ

- `updated_at`
- `updated_by`
- `cancel_reason`（停止/取り消しの理由）

## 別シート（推奨・将来）

台帳を軽く保ち、学習可能ログを残すために **`asin_attempts`**（append-only）を追加してよい。
列案は `workflow-states.md` の「試行ログ」セクションを参照。

