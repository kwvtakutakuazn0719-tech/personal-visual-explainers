# Shopee Explainer — Common（Layer ①）

すべての **Shopee 図解カテゴリスキル** が共有する正本です。

- **SKILL.md** — 成果物・禁止・依存の読み順・要約のみ（詳細は下記 `references/` に集約）  
- **references/** — `shopee-generation-ssot.md`（正本マップ・品質ゲート・完了テンプレ・画像カード背景） / `shopee-specs.md` / `base.html` / `main-image.html` / **`size-charts/`**（サイズルールの本文＋ PNG 置き場）

### ヒアリング（意図の取り方）

リポジトリ直下 `README.md` の「ヒアリングシート」は **パーソナル図解スキル**向け。Shopee 図解の入力は **カテゴリスキル（例: アウトドア）の Step 1 の箇条書き自由記述**がインターフェースであり、別紙シートとの 1:1 対応は設けていない。

## 起動について

単体のトリガー語は設けていません。**カテゴリスキル（例: アウトドア図解）の Step 0 で必ず読み込む**想定です。  
Cursor では `disable-model-invocation: true` を付与し、**一般チャットからの自動起動を避ける**用途にしています。

## カテゴリスキル例

- `shopee-outdoor-explainer` — トリガー: **「アウトドア図解」**

## 将来カテゴリの一覧メモ

`../SHOPEE_CATEGORY_MEMO.md`（① Fashion ～ ⑥ Outdoor の束だけ記載）
