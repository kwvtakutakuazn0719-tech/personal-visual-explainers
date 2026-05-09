---
title: Schedule (SSOT)
---

# 定期実行の方針

## 正本

- **毎日 06:00 JST** に「調査ラン」を 1 回走らせる（朝の業務開始時に台帳がいちばん新しい状態を目指す）。
- **実行キックの主シナリオは GitHub Actions**（リポジトリの `.github/workflows/`）。詳細は `github-actions-schedule.md`。

## 手動

- `workflow_dispatch` や、朝のチャットからの手動実行は **再実行・デバッグ用**の補助線。
