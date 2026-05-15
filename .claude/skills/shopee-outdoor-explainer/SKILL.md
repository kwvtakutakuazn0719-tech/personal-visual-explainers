---
name: shopee-outdoor-explainer
description: >-
  Shopee outdoor gear product explainer HTML (English, PNG via screenshot): description card + main image.
  Use only when the user says 「アウトドア図解」. Not for generic 図解 ("図解して") or non-Shopee explainer requests.
---

# Shopee Outdoor Explainer（Layer ②）

アウトドア向け（シューズ・ウェア・ギア・バッグ等）の **Shopee 商品図解** を生成する。  
**先に** 同じリポジトリ内の **共通正本** を読む: `.claude/skills/shopee-explainer-common/SKILL.md`（およびその `references/`）。

共通 `SKILL.md` の **禁止・寸法** と、`shopee-explainer-common/references/` の **正本**（`shopee-generation-ssot.md` の品質・完了テンプレ・画像背景、`main-image.html` のレイアウト・Others、`size-charts/README.md` のサイズ）に従う。本ファイルは **アウトドア固有のワークフローと参照**だけを持つ。

## 本スキル専用の依存

- `references/pattern-guide.md` — Pattern A/B/C の判断
- `references/pattern-a-feature.html` / `pattern-b-lineup.html` / `pattern-c-activity.html`
- `references/module-guide.md` — モジュール説明（必要に応じて）
- `references/model-*.html` — 説明カードの部品見本（必要に応じて）

メイン画像・`base.html`・Shopee 仕様は **`../shopee-explainer-common/references/`** を参照する。

## ワークフロー

### Step 0: 共通スキルを読む

1. `.claude/skills/shopee-explainer-common/SKILL.md` を読む（依存 `references/` の読み順に従う）  
2. `shopee-explainer-common/references/base.html` が存在するか確認する。無い場合はスキル構成の不整合。

### Step 1: 入力をまとめて受け取る（生成は入力が揃うまで開始しない）

チャット本文の箇条書きで依頼する（AskQuestion は使わない）。

> 以下を **1 メッセージ** にまとめてください（画像は添付）。
>
> 1. **Amazon の商品ページ URL**（全文）  
> 2. **商品名**（入力どおり使用。Amazon からは読まない）  
> 3. **性別**: Men's / Women's / Unisex / なし（日本語可 → エージェントが正規化）  
> 4. **バリュエーション総数**（Amazon に載っている色・モデル合計）  
> 5. **バリュエーション画像**（最大 4 枚推奨。枚数と総数の差が Others の `+N`）

メモ: `product-name`, `gender`, `variation-total`, `variation-images`, `others-count` = 総数 − 添付枚数（0 以下なら Others なし）  
**`variation-total` が 1 のとき**、添付が複数あればその超過分は「色展開」ではなく **別アングル・ディテール・利用シーンなどの写真集**として扱ってよい（Amazon のギャラリー行に近い）。**総数1かつ添付1枚のみ**のときは `main-image` の **下段ギャラリー（Section 3）を出さず**メイン画像だけにする（`main-image.html` のコメントSSOT）。

### Step 2: 添付が 5 枚以上の場合

選択肢 UI は使わない。**デフォルト**は先頭 4 枚のみ表示し、超過分を `others-count` に加算。ユーザーが同一メッセージで「5 枚以上すべて表示」と明示した場合のみ全枚表示（レイアウトリスクあり）。

### Step 3: 性別「なし」の場合

本文で依頼: **Activity タグ**（英語 3 つ）か **Spec ハイライト**（数値 3 つ）を文章で指定。未記入なら Amazon 説明から Activity を推定してよい、と添える。

### Step 4: 商品情報の収集（アウトドア向け）

- **バリエーションの種類・一覧** → Step 1 の Amazon ページに限定  
- **説明・技術** → ブランド公式・専門小売を優先  
- 主要機能 3〜5、用途・対象ユーザー、レビュー肯定点 2〜3、バリエ一覧  
- **単一型番だけに寄せない** — シリーズ／ラインナップ全体

### Step 4b: サイズ情報（シューズ・アパレル等）

商品が **靴・ブーツ・サンダル・サイズ軸のあるウェア**など、サイズが購買判断に効くものに該当する場合:

1. **数値・対応の確定**は **`../shopee-explainer-common/references/size-charts/README.md` のみ**に従う（倉庫 PNG の命名・優先順位・Unisex＝mens・分割スクショの統合・免除の判断）。ここに列挙を重複させない。
2. **確定した内容はチャート PNG をそのまま貼らず**、`pattern` / `base.html` に沿った **HTML 表（英語・Tailwind）** で `product-card` の Size Guide に書く。
3. **フットウェア**では Size Guide を **省略しない**（ソースが弱い場合は README の方針どおり一般換算＋注釈で埋める）。

**キャンプギア等、サイズ表が本質でない商品**では Step 4b をスキップし、**Size Guide を入れない**（上記 README の免除に従う）。

### Step 4c: Shopee プロダクト名の下書き

収集した調査結果を使い、**`../shopee-explainer-common/references/shopee-product-listing-title.md`** のルールで  
**英語 1 行・100 文字以内**の Shopee プロダクト名を作る。

### Step 4d: SEO / AEO レビュー

**`.claude/skills/shopee-product-name-seo-aeo-review/SKILL.md`** と  
**`.claude/skills/shopee-product-name-seo-aeo-review/references/seo-aeo-rubric.md`** を読み、Step 4c の下書きを点検する。  
**必須修正**と **改版ヒント**を内部で確定し、完了報告にはレビュー長文を出さない。

### Step 4e: Shopee プロダクト名の確定

Step 4d の結果を反映して **最終行**を作り直し、**100 文字以内**で再カウントする。  
完了報告に出すコードブロックは **この Step 4e 確定版のみ**。

### Step 5: 画像を `output/shopee/{product-slug}/` に保存

`variation-01.png` から連番。HTML の `<img>` は `./variation-XX.png`。

**`main-image` の下段（Section 3）との対応**

- **`variation-total` = 1 かつ添付が 1 枚** → 下段ギャラリーは **省略**（メイン画像のみ・縦スペースは上段へ）。
- **`variation-total` = 1 かつ添付が 2 枚以上** → 下段は **写真集**（`02` 以降は別アングル・利用シーン等）。セル下ラベルは **色名固定にしない**（写っている内容の短い英語）。
- **`variation-total` ≥ 2** → 下段は従来どおり **バリエーション一覧** + 必要なら Others。  
  **`variation-01.png` はメイン専用**とし、下段の `<img>` に **同じファイルを二度使わない**（下段は `02` 以降のみ。4色4枚なら下段は最大3枠で02〜04）。

### Step 6: 説明カード用レイアウト（Pattern）

`pattern-guide.md` のフローで決定。迷ったら **Pattern A**。

```
複数モデルで「どれを選ぶか」が主疑問 → Pattern B
独自技術・構造の説明が主 → Pattern A
汎用ライフスタイル寄り → Pattern C
```

選んだ `pattern-*.html` を読んでから HTML 生成へ。

### Step 7: HTML を 2 枚生成する

1. **`../shopee-explainer-common/references/main-image.html`** を読んでからメイン画像を書く。  
2. 説明カードは選んだパターンの構成に沿い、**共通 `references/`**（`main-image.html`・`shopee-generation-ssot.md`・`SKILL.md` の寸法・禁止）のルールを守る。  
3. `base.html` の `<head>` 方針は共通スキルのテンプレに合わせる。  
4. **フットウェアおよびサイズが重要なアパレル**では Step 4b で確定した **Size Guide を HTML 表で `product-card` に含める**（チャート PNG をそのまま貼らない）。メイン画像にサイズ表は不要。

### Step 8: 保存とエクスプローラー

共通スキル記載のパスに保存し、**必ず** `explorer` で出力フォルダを開く（Windows・絶対パス可）。

### Step 9: 完了報告

`../shopee-explainer-common/references/shopee-generation-ssot.md` の **完了報告テンプレ** をそのまま使う。  
このテンプレには **HTML 2 枚 + Shopee プロダクト名コードブロック** が含まれるため、省略しない。

## 守ること（カテゴリ＋共通）

- **トリガーは「アウトドア図解」のみ** — 「商品図解」では起動しない。一般的な図解依頼では使わない  
- **Step 0 で共通スキルを読む前に HTML を書かない**  
- **パターン選択（Step 6）をスキップしない**  
- その他の禁止・品質は **`../shopee-explainer-common/SKILL.md`** と **`../shopee-explainer-common/references/shopee-generation-ssot.md`** に従う
