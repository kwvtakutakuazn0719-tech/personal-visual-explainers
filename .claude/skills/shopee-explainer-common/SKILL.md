---
name: shopee-explainer-common
description: >-
  Canonical rules for Shopee explainer HTML (800px description card + 800×800 main image): shared templates,
  prohibitions, pointers to SSOT references (quality gate, screenshot workflow). Read together with a category skill (e.g. outdoor).
  Do not use for generic diagram requests ("図解して" without Shopee explainer context).
disable-model-invocation: true
---

# Shopee Explainer — Common (Layer ①)

カテゴリ別スキル（アウトドア図解など）が **HTML を生成する前に必ず読む**レイヤー。  
詳細ルールの **本文は `references/` 内の正本**に置き、本 SKILL は **役割・禁止・読む順**だけを書く（重複を増やさない）。

## 成果物（すべてのカテゴリ共通）

Shopee の Description 用 **説明カード**（幅 800px）と、商品ページ用 **メイン画像**（800×800px・1:1）の **2 枚**を HTML として出す。

| 出力 | ファイル名 | 仕様 |
|------|------------|------|
| 説明カード | `product-card-{product-slug}.html` | 幅 800px（`body` / ラッパーで固定） |
| メイン画像 | `main-image-{product-slug}.html` | `width:800px;height:800px;` で固定 |

保存先（リポジトリルート相対）: `output/shopee/{product-slug}/`  
バリエーション画像: `variation-01.png` …（HTML からは `./variation-01.png`）

## 禁止事項（共通）

- **英語のみ**（タイトル・本文・ラベル）
- **価格・配送・返品を書かない**
- **800px（カード）・800×800（メイン）を崩さない**
- **JavaScript を追加しない**（`lucide.createIcons()` 等、テンプレ既存のものは可）
- **外部画像 CDN はテンプレの範囲内**（Google Fonts・Tailwind CDN・unpkg Lucide のみ想定）
- **絵文字禁止** — アイコンは Lucide
- **入力収集に Cursor AskQuestion を使わない** — 箇条書きの自由記述
- **商品名を Amazon から読み取ってタイトルにしない** — ユーザー入力をそのまま使う（カテゴリスキル Step 1）

## 依存ファイル（読み込み順の目安）

1. `references/shopee-specs.md` — 画像制限・**Chrome スクショ手順**・2MB・tinypng
2. `references/shopee-generation-ssot.md` — **正本マップ**・品質ゲート・完了報告テンプレ・画像カード背景ルール
3. `references/base.html` — 説明カード用 `<head>` / Tailwind 配色（800px）
4. `references/main-image.html` — メイン 800×800 の **構造・Layout A/B・キャッチ帯・フッター・Others**（コメント＋マークアップが SSOT）
5. `references/size-charts/README.md` — サイズ倉庫・命名・**優先順位・Unisex・免除・HTML 表化**（サイズに関する本文の SSOT）

生成直前のチェックリストと完了報告の文言は **`shopee-generation-ssot.md` に合わせる**（本 SKILL に繰り返し書かない）。

## メイン画像・サイズ（要約のみ）

- **レイアウト・Others・キャッチ帯のルール**は `main-image.html` のコメントに従う（ここに長文を複製しない）。
- **サイズ表の扱い**（チャート PNG は数値ソースのみ、英語表への再構成、分割スクショの統合、フットウェア必須等）は **`size-charts/README.md` のみ**を編集・参照する。

## 性別バッジ（見た目の共通ルール）

- Men's → 青系バッジ
- Women's → ピンク系
- Unisex → グレー系
- 「なし」のときの Activity / Spec 代替は **カテゴリスキル**の Step 1〜3 に従う

## カテゴリスキル側の責務

- **トリガー語**・**収集する商品ジャンル**・**パターン A/B/C の選択**・ジャンル固有のコピートーン
- 生成前に **本ファイルと上記 `references/` 正本**を読んだうえでワークフローを進める
