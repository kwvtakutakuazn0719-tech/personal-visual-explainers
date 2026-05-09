---
title: Source register template
---

# 情報源レジストリ（`scope` シート用テンプレ）

## 列案

| category | brand | source_type | source_url | priority | notes |
|----------|-------|---------------|------------|----------|-------|
| running | asics | official | https://… | high | 新作ページ |
| running | asics | blog | https://… | mid | 週1更新 |
| trailrunning | salomon | ec | https://… | mid | ログイン不要 |

## source_type の例

- `official` — ブランド公式
- `blog` — ブログ・メディア
- `ec` — 小売 EC
- `amazon` — Amazon（方針に応じて。規約・自動取得の可否は `source-risks.md`）
- `sns` — SNS（API 課金・取得可否は別途）

## notes に書くこと

- ログイン壁の有無
- 更新頻度
- スクレイピング可否（許可された範囲のみ）
