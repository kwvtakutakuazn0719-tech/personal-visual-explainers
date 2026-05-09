# Module Guide

## 目次

- モジュール一覧
- 商品タイプ別デフォルト構成
- モジュール選択の判断基準

---

## モジュール一覧

| ID | モジュール名 | 目的 | 対象読者 |
|---|---|---|---|
| `features` | Key Features | ブランド・商品名・タグライン・「Best for」タグ・機能カード群 | 全員（表層・最重要） |
| `specs` | Technical Specifications | 数値スペック（重量・ドロップ・スタック等）+ 技術解説 | 経験者向け詳細層 |
| `material` | Material Breakdown | 素材構成（アッパー・ミッドソール・アウトソール）の図解 | 中上級者 |
| `activity-fit` | Activity & Use Case | 用途適性チャート（トレイル / ロード / ハイキング / レースなど） | 全員 |
| `size-guide` | Size Guide | サイズ変換表 + フィット感の注意点 + 計測方法 | 全員（購入直前の不安解消） |
| `comparison` | vs. Similar Products | 同価格帯の競合品との比較（ポジショニングの明確化） | 比較検討中の経験者 |
| `pairs-with` | Pairs Well With | 相性の良い関連商品カード（クロスセル用） | 全員 |

---

## 商品タイプ別デフォルト構成

### トレイルランニングシューズ / ロードランニングシューズ

```
01-features.html     ← features（必須）
02-specs.html        ← specs（必須）
03-material.html     ← material（推奨）
04-activity-fit.html ← activity-fit（推奨）
05-size-guide.html   ← size-guide（必須）
```

### トレッキング・ハイキングシューズ

```
01-features.html     ← features（必須）
02-specs.html        ← specs（必須）
03-activity-fit.html ← activity-fit（必須）
04-size-guide.html   ← size-guide（必須）
```

### アパレル（ジャケット・シャツ・タイツ等）

```
01-features.html     ← features（必須）
02-material.html     ← material（必須）
03-activity-fit.html ← activity-fit（推奨）
04-size-guide.html   ← size-guide（必須）
```

### キャンプギア・アクセサリー

```
01-features.html     ← features（必須）
02-specs.html        ← specs（推奨）
03-use-case.html     ← activity-fit の「用途シーン特化」版として使う
```

---

## モジュール選択の判断基準

**`features` は必ず1枚目に入れる。**
これが最初に目に入る画像になる。ブランド + 商品名 + タグライン + 機能カードで構成する。

**スペックに数値がある商品 → `specs` を追加する。**
重量・ドロップ・スタック高・防水性（Hm値）・強度（デニール数）など、
数字で語れる情報がある場合は必ず `specs` カードを作る。
数値がほとんどない商品（アパレルの一部等）では `material` で代替する。

**「何をするときに使う？」が明確な商品 → `activity-fit` を追加する。**
「これはランニング専用か？ ハイキングでも使えるか？」という疑問を事前に解決する。

**シューズ・アパレル（サイズ選択が必要）→ `size-guide` は必須。**
購入直前の「サイズ不安」は離脱の最大原因。必ず入れる。

**同価格帯に有名な競合がいる → `comparison` を追加する。**
「Hoka と何が違う？」「Salomonを選ぶ理由は？」を図で答える。

**関連商品を持っている → `pairs-with` を追加する。**
シューズなら専用ソックス・インソール・シューズバッグなど。
クロスセルのきっかけになる。
